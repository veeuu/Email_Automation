import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Replace all steps for a workflow (full save)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const wf = await prisma.workflow.findFirst({ where: { id, userId: session.user.id } });
  if (!wf) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { steps } = await req.json();

  // Delete existing steps and recreate
  await prisma.workflowStep.deleteMany({ where: { workflowId: id } });

  if (steps && steps.length > 0) {
    await prisma.workflowStep.createMany({
      data: steps.map((s: {
        id?: string; type: string; config?: object;
        positionX?: number; positionY?: number;
        parentId?: string; branch?: string; order?: number;
      }) => ({
        id: s.id,
        workflowId: id,
        type: s.type,
        config: s.config ?? {},
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
