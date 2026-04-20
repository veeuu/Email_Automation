import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type CampaignWithEvents = Awaited<ReturnType<typeof getCampaigns>>[0];
type EmailEvent = CampaignWithEvents["events"][0];

async function getCampaigns(userId: string) {
  return prisma.campaign.findMany({
    where: { userId },
    include: { events: true, _count: { select: { recipients: true } } },
  });
}

const count = (events: EmailEvent[], type: string) =>
  events.filter((e) => e.eventType === type).length;

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const campaigns = await getCampaigns(session.user.id);

  const totalSent = campaigns.reduce((acc: number, c: CampaignWithEvents) => acc + count(c.events, "SENT"), 0);
  const totalOpened = campaigns.reduce((acc: number, c: CampaignWithEvents) => acc + count(c.events, "OPENED"), 0);
  const totalClicked = campaigns.reduce((acc: number, c: CampaignWithEvents) => acc + count(c.events, "CLICKED"), 0);

  const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : null;
  const clickRate = totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(1) : null;

  return NextResponse.json({
    totalCampaigns: campaigns.length,
    totalSent,
    openRate,
    clickRate,
    recentCampaigns: campaigns.slice(0, 5).map((c: CampaignWithEvents) => ({
      id: c.id,
      name: c.name,
      subject: c.subject,
      status: c.status,
      recipients: c._count.recipients,
      sent: count(c.events, "SENT"),
      opened: count(c.events, "OPENED"),
      clicked: count(c.events, "CLICKED"),
      createdAt: c.createdAt,
    })),
  });
}
