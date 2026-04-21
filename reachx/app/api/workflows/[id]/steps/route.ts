import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const wf = await prisma.workflow.findFirst({ where: { id, userId: session.user.id } });
  if (!wf) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { steps } = await req.json();

  // Snapshot current steps as a version before overwriting
  const currentSteps = await prisma.workflowStep.findMany({ where: { workflowId: id } });
  if (currentSteps.length > 0) {
    const lastVersion = await prisma.workflowVersion.findFirst({
      where: { workflowId: id },
      orderBy: { version: "desc" },
    });
    await prisma.workflowVersion.create({
      data: {
        workflowId: id,
        version: (lastVersion?.version ?? 0) + 1,
        stepsJson: currentSteps as never,
      },
    });
    // Keep only last 10 versions
    const allVersions = await prisma.workflowVersion.findMany({
      where: { workflowId: id },
      orderBy: { version: "desc" },
    });
    if (allVersions.length > 10) {
      const toDelete = allVersions.slice(10).map((v) => v.id);
      await prisma.workflowVersion.deleteMany({ where: { id: { in: toDelete } } });
    }
  }

  await prisma.workflowStep.deleteMany({ where: { workflowId: id } });

  if (steps && steps.length > 0) {
    await prisma.workflowStep.createMany({
      data: steps.map((s: {
        id?: string; type: string; config?: object; notes?: string;
        positionX?: number; positionY?: number;
        parentId?: string; branch?: string; order?: number;
      }) => ({
        id: s.id,
        workflowId: id,
        type: s.type,
        config: s.config ?? {},
        notes: s.notes ?? null,
        positionX: s.positionX ?? 0,
        positionY: s.positionY ?? 0,
        parentId: s.parentId ?? null,
        branch: s.branch ?? null,
        order: s.order ?? 0,
      })),
    });
  }

  const updated = await prisma.workflowStep.findMany({ where: { workflowId: id } });
  return NextResponse.json(updated);
}
