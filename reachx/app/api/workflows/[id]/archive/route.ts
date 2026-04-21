import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const wf = await prisma.workflow.findFirst({ where: { id, userId: session.user.id } });
  if (!wf) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.workflow.update({
    where: { id },
    data: { archived: !wf.archived },
  });
  return NextResponse.json(updated);
}
