import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import dns from "dns/promises";

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "guerrillamail.com", "tempmail.com", "throwaway.email",
  "yopmail.com", "sharklasers.com", "spam4.me", "trashmail.com", "dispostable.com",
]);

async function quickValidate(email: string): Promise<"VALID" | "RISKY" | "INVALID"> {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "INVALID";
  const domain = email.split("@")[1].toLowerCase();
  if (DISPOSABLE_DOMAINS.has(domain)) return "INVALID";
  try {
    const records = await dns.resolveMx(domain);
    return records?.length ? "RISKY" : "INVALID";
  } catch {
    return "INVALID";
  }
}

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

  // Quick format + MX validation to set initial status
  const withStatus = await Promise.all(
    newEmails.map(async (email) => ({ email, campaignId: id, status: await quickValidate(email) }))
  );

  await prisma.recipient.createMany({ data: withStatus });

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
