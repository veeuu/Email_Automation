import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

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

  const contact = await prisma.contact.upsert({
    where: { email_userId: { email, userId: session.user.id } },
    update: { name, phone, company, tags },
    create: { email, name, phone, company, tags, userId: session.user.id },
  });

  return NextResponse.json(contact, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  await prisma.contact.delete({ where: { id, userId: session.user.id } });
  return NextResponse.json({ ok: true });
}
