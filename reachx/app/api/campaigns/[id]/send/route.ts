import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendEmail } from "@/lib/brevo";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const campaign = await prisma.campaign.findFirst({
    where: { id, userId: session.user.id },
    include: { recipients: true },
  });

  if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  if (campaign.status === "SENDING" || campaign.status === "SENT") {
    return NextResponse.json({ error: "Campaign already sent" }, { status: 400 });
  }

  await prisma.campaign.update({ where: { id }, data: { status: "SENDING" } });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  let successCount = 0;

  for (const recipient of campaign.recipients) {
    try {
      const trackingPixel = `<img src="${appUrl}/api/track?rid=${recipient.id}&cid=${campaign.id}&type=open" width="1" height="1" style="display:none" />`;
      const htmlWithTracking = campaign.content + trackingPixel;

      await sendEmail({
        to: recipient.email,
        subject: campaign.subject,
        htmlContent: htmlWithTracking,
      });

      await prisma.emailEvent.create({
        data: {
          eventType: "SENT",
          campaignId: campaign.id,
          recipientId: recipient.id,
        },
      });

      successCount++;
    } catch (err) {
      console.error(`Failed to send to ${recipient.email}:`, err);
      await prisma.emailEvent.create({
        data: {
          eventType: "BOUNCED",
          campaignId: campaign.id,
          recipientId: recipient.id,
          metadata: { error: String(err) },
        },
      });
    }
  }

  await prisma.campaign.update({ where: { id }, data: { status: "SENT" } });

  return NextResponse.json({ sent: successCount, total: campaign.recipients.length });
}
