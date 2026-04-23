import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const campaign = await prisma.campaign.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (campaign.status !== "DRAFT") {
    return NextResponse.json({ error: "Only DRAFT campaigns can be scheduled" }, { status: 400 });
  }

  const { scheduledAt } = await req.json();
  const sendAt = new Date(scheduledAt);
  if (isNaN(sendAt.getTime()) || sendAt <= new Date()) {
    return NextResponse.json({ error: "scheduledAt must be a future date" }, { status: 400 });
  }

  // Just save to DB — the cron job at /api/cron/send-scheduled picks it up
  const updated = await prisma.campaign.update({
    where: { id },
    data: { scheduledAt: sendAt, status: "SCHEDULED" },
  });

  console.log(`[schedule] Campaign ${id} scheduled for ${sendAt.toISOString()}`);
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const campaign = await prisma.campaign.findFirst({ where: { id, userId: session.user.id } });
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.campaign.update({
    where: { id },
    data: { scheduledAt: null, status: "DRAFT" },
  });

  console.log(`[schedule] Campaign ${id} unscheduled`);
  return NextResponse.json(updated);
}
