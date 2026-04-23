import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const segments = await prisma.segment.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(segments);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, filterType, filterValue } = await req.json();
  if (!name || !filterType) {
    return NextResponse.json({ error: "name and filterType required" }, { status: 400 });
  }

  const segment = await prisma.segment.create({
    data: { name, filterType, filterValue: filterValue ?? null, userId: session.user.id },
  });
  return NextResponse.json(segment, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  await prisma.segment.delete({ where: { id, userId: session.user.id } });
  return NextResponse.json({ ok: true });
}
