import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { emails } = await req.json();

  const campaign = await prisma.campaign.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found or already sent" }, { status: 404 });
  }

  // Add only new emails (skip duplicates)
  const existing = await prisma.recipient.findMany({ where: { campaignId: id } });
  const existingEmails = new Set(existing.map((r: { email: string }) => r.email));
  const newEmails = (emails as string[]).filter((e) => !existingEmails.has(e));

  await prisma.recipient.createMany({
    data: newEmails.map((email) => ({ email, campaignId: id })),
  });

  return NextResponse.json({ added: newEmails.length });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { recipientId } = await req.json();

  await prisma.recipient.delete({ where: { id: recipientId, campaignId: id } });
  return NextResponse.json({ ok: true });
}
