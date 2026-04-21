import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const wf = await prisma.workflow.findFirst({ where: { id, userId: session.user.id } });
  if (!wf) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const versions = await prisma.workflowVersion.findMany({
    where: { workflowId: id },
    orderBy: { version: "desc" },
  });
  return NextResponse.json(versions);
}

// Restore a version
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const wf = await prisma.workflow.findFirst({ where: { id, userId: session.user.id } });
  if (!wf) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { versionId } = await req.json();
  const version = await prisma.workflowVersion.findFirst({ where: { id: versionId, workflowId: id } });
  if (!version) return NextResponse.json({ error: "Version not found" }, { status: 404 });

  const steps = version.stepsJson as Array<Record<string, unknown>>;

  await prisma.workflowStep.deleteMany({ where: { workflowId: id } });
  if (steps.length > 0) {
    await prisma.workflowStep.createMany({ data: steps.map((s) => ({ ...s, workflowId: id })) });
  }

  return NextResponse.json({ restored: true, version: version.version });
}
