import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function getWorkflow(id: string, userId: string) {
  return prisma.workflow.findFirst({ where: { id, userId } });
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const workflow = await prisma.workflow.findFirst({
    where: { id, userId: session.user.id },
    include: { steps: { orderBy: { order: "asc" } } },
  });
  if (!workflow) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(workflow);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const wf = await getWorkflow(id, session.user.id);
  if (!wf) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const updated = await prisma.workflow.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.triggerType !== undefined && { triggerType: body.triggerType }),
      ...(body.triggerConfig !== undefined && { triggerConfig: body.triggerConfig }),
      ...(body.allowReEnrollment !== undefined && { allowReEnrollment: body.allowReEnrollment }),
      ...(body.exitOnUnsubscribe !== undefined && { exitOnUnsubscribe: body.exitOnUnsubscribe }),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const wf = await getWorkflow(id, session.user.id);
  if (!wf) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.workflow.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
