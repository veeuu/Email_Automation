import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, senderName: true, replyTo: true },
  });
  return NextResponse.json(user);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, senderName, replyTo } = await req.json();

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(name !== undefined && { name: name || null }),
      ...(senderName !== undefined && { senderName: senderName || null }),
      ...(replyTo !== undefined && { replyTo: replyTo || null }),
    },
    select: { name: true, email: true, senderName: true, replyTo: true },
  });

  return NextResponse.json(updated);
}
