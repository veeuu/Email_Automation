import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { triggerWorkflows } from "@/lib/triggerWorkflows";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contacts = await prisma.contact.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(contacts);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { email, name, phone, company, tags } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const existing = await prisma.contact.findUnique({
    where: { email_userId: { email, userId: session.user.id } },
  });

  const contact = await prisma.contact.upsert({
    where: { email_userId: { email, userId: session.user.id } },
    update: { name, phone, company, tags },
    create: { email, name, phone, company, tags, userId: session.user.id },
  });

  // Fire CONTACT_CREATED workflows only for genuinely new contacts
  if (!existing) {
    await triggerWorkflows(session.user.id, "CONTACT_CREATED", email).catch(() => {});
  }

  // Fire TAG_ADDED workflows for any newly added tags
  if (tags) {
    const existingTags = existing?.tags
      ? existing.tags.split(",").map((t: string) => t.trim().toLowerCase())
      : [];
    const newTags = tags
      .split(",")
      .map((t: string) => t.trim())
      .filter((t: string) => t && !existingTags.includes(t.toLowerCase()));
    for (const tag of newTags) {
      triggerWorkflows(session.user.id, "TAG_ADDED", email, { tag }).catch(() => {});
    }
  }

  return NextResponse.json(contact, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  await prisma.contact.delete({ where: { id, userId: session.user.id } });
  return NextResponse.json({ ok: true });
}
