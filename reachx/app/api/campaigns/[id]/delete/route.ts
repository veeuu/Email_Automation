import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { emailQueue } from "@/lib/queue";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const campaign = await prisma.campaign.findFirst({ where: { id, userId: session.user.id } });
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Cancel any scheduled job
  try {
    const job = await emailQueue.getJob(`campaign-${id}`);
    if (job) await job.remove();
  } catch { /* Redis might be down, continue anyway */ }

  // Delete related records first (FK constraints)
  await prisma.emailEvent.deleteMany({ where: { campaignId: id } });
  await prisma.unsubscribeToken.deleteMany({ where: { campaignId: id } });
  await prisma.recipient.deleteMany({ where: { campaignId: id } });
  await prisma.campaign.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
