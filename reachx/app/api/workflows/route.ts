import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workflows = await prisma.workflow.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { steps: true, enrollments: true } },
    },
  });
  return NextResponse.json(workflows);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, triggerType, triggerConfig } = await req.json();
  if (!name || !triggerType) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const workflow = await prisma.workflow.create({
    data: {
      name,
      triggerType,
      triggerConfig: triggerConfig ?? {},
      userId: session.user.id,
    },
  });

  return NextResponse.json(workflow, { status: 201 });
}
