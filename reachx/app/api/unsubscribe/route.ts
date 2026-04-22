import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  const record = await prisma.unsubscribeToken.findUnique({ where: { token } });
  if (!record) return NextResponse.json({ error: "Invalid token" }, { status: 404 });

  // Mark contact as unsubscribed
  await prisma.contact.updateMany({
    where: { email: record.email, userId: record.userId },
    data: { unsubscribed: true },
  });

  // Log the event if tied to a campaign
  if (record.campaignId) {
    const recipient = await prisma.recipient.findFirst({
      where: { email: record.email, campaignId: record.campaignId },
    });
    if (recipient) {
      await prisma.emailEvent.create({
        data: {
          eventType: "UNSUBSCRIBED",
          campaignId: record.campaignId,
          recipientId: recipient.id,
        },
      });
    }
  }

  // Unenroll from all active workflows with exitOnUnsubscribe
  const enrollments = await prisma.workflowEnrollment.findMany({
    where: { contactEmail: record.email, status: "ACTIVE" },
    include: { workflow: { select: { exitOnUnsubscribe: true } } },
  });
  for (const e of enrollments) {
    if (e.workflow.exitOnUnsubscribe) {
      await prisma.workflowEnrollment.update({
        where: { id: e.id },
        data: { status: "PAUSED" },
      });
    }
  }

  // Mark token as used
  await prisma.unsubscribeToken.update({
    where: { token },
    data: { usedAt: new Date() },
  });

  // Redirect to confirmation page
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return NextResponse.redirect(`${appUrl}/unsubscribed`);
}
