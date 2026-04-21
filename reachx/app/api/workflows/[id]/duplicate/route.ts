import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const original = await prisma.workflow.findFirst({
    where: { id, userId: session.user.id },
    include: { steps: true },
  });
  if (!original) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const idMap = new Map<string, string>();
  original.steps.forEach((s) => idMap.set(s.id, Math.random().toString(36).slice(2, 10)));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const copy = await (prisma.workflow as any).create({
    data: {
      name: `${original.name} (copy)`,
      triggerType: original.triggerType,
      triggerConfig: original.triggerConfig ?? {},
      userId: session.user.id,
      allowReEnrollment: original.allowReEnrollment,
      exitOnUnsubscribe: original.exitOnUnsubscribe,
      steps: {
        create: original.steps.map((s) => ({
          id: idMap.get(s.id),
          type: s.type,
          config: s.config ?? {},
          notes: s.notes ?? null,
          positionX: s.positionX,
          positionY: s.positionY,
          parentId: s.parentId ? (idMap.get(s.parentId) ?? null) : null,
          branch: s.branch,
          order: s.order,
        })),
      },
    },
  });

  return NextResponse.json(copy, { status: 201 });
}
