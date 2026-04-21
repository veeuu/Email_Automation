import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const wf = await prisma.workflow.findFirst({ where: { id, userId: session.user.id } });
  if (!wf) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const enrollments = await prisma.workflowEnrollment.findMany({
    where: { workflowId: id, ...(status ? { status: status as never } : {}) },
    orderBy: { enrolledAt: "desc" },
    include: { events: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  return NextResponse.json(enrollments);
}
