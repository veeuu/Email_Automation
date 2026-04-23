import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// POST /api/contacts/bulk
// body: { action: "delete" | "tag" | "untag", ids: string[], tag?: string }
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { action, ids, tag } = await req.json();
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "No contacts selected" }, { status: 400 });
  }

  // Verify all contacts belong to this user
  const contacts = await prisma.contact.findMany({
    where: { id: { in: ids }, userId: session.user.id },
  });
  if (contacts.length === 0) return NextResponse.json({ error: "No valid contacts" }, { status: 404 });

  if (action === "delete") {
    await prisma.contact.deleteMany({ where: { id: { in: ids }, userId: session.user.id } });
    return NextResponse.json({ affected: contacts.length });
  }

  if (action === "tag" && tag) {
    for (const contact of contacts) {
      const existing = contact.tags ? contact.tags.split(",").map((t) => t.trim()) : [];
      if (!existing.map((t) => t.toLowerCase()).includes(tag.toLowerCase())) {
        const merged = [...existing, tag].join(", ");
        await prisma.contact.update({ where: { id: contact.id }, data: { tags: merged } });
      }
    }
    return NextResponse.json({ affected: contacts.length });
  }

  if (action === "untag" && tag) {
    for (const contact of contacts) {
      if (!contact.tags) continue;
      const remaining = contact.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.toLowerCase() !== tag.toLowerCase())
        .join(", ");
      await prisma.contact.update({ where: { id: contact.id }, data: { tags: remaining || null } });
    }
    return NextResponse.json({ affected: contacts.length });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
