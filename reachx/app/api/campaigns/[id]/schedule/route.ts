import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { emailQueue } from "@/lib/queue";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const campaign = await prisma.campaign.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (campaign.status !== "DRAFT") return NextResponse.json({ error: "Only DRAFT campaigns can be scheduled" }, { status: 400 });

  const { scheduledAt } = await req.json();
  const sendAt = new Date(scheduledAt);
  if (isNaN(sendAt.getTime()) || sendAt <= new Date()) {
    return NextResponse.json({ error: "scheduledAt must be a future date" }, { status: 400 });
  }

  const delayMs = sendAt.getTime() - Date.now();

  // Queue a delayed job that will call the send route
  await emailQueue.add(
    "send-campaign",
    { campaignId: id, userId: session.user.id },
    { delay: delayMs, jobId: `campaign-${id}` }
  );

  const updated = await prisma.campaign.update({
    where: { id },
    data: { scheduledAt: sendAt, status: "SCHEDULED" },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const campaign = await prisma.campaign.findFirst({ where: { id, userId: session.user.id } });
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Remove the queued job
  const job = await emailQueue.getJob(`campaign-${id}`);
  if (job) await job.remove();

  const updated = await prisma.campaign.update({
    where: { id },
    data: { scheduledAt: null, status: "DRAFT" },
  });

  return NextResponse.json(updated);
}
