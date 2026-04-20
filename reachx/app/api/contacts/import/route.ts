import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// POST /api/contacts/import — accepts array of contacts parsed from CSV
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { contacts } = await req.json();
  if (!Array.isArray(contacts) || contacts.length === 0) {
    return NextResponse.json({ error: "No contacts provided" }, { status: 400 });
  }

  let imported = 0;
  for (const c of contacts) {
    if (!c.email) continue;
    await prisma.contact.upsert({
      where: { email_userId: { email: c.email, userId: session.user.id } },
      update: { name: c.name, phone: c.phone, company: c.company, tags: c.tags },
      create: {
        email: c.email,
        name: c.name ?? null,
        phone: c.phone ?? null,
        company: c.company ?? null,
        tags: c.tags ?? null,
        userId: session.user.id,
      },
    });
    imported++;
  }

  return NextResponse.json({ imported });
}
