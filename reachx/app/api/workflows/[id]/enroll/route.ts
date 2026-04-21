import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { workflowQueue } from "@/lib/workflowQueue";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const wf = await prisma.workflow.findFirst({
    where: { id, userId: session.user.id },
    include: { steps: { orderBy: { order: "asc" } } },
  });
  if (!wf) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (wf.status !== "ACTIVE") return NextResponse.json({ error: "Workflow is not active" }, { status: 400 });

  const { emails } = await req.json() as { emails: string[] };
  if (!emails?.length) return NextResponse.json({ error: "No emails provided" }, { status: 400 });

  const firstStep = wf.steps.find((s) => s.type === "TRIGGER") ?? wf.steps[0];

  const enrollments = await Promise.all(
    emails.map((email) =>
      prisma.workflowEnrollment.upsert({
        where: { workflowId_contactEmail: { workflowId: id, contactEmail: email } },
        create: { workflowId: id, contactEmail: email, currentStepId: firstStep?.id },
        update: { status: "ACTIVE", currentStepId: firstStep?.id },
      })
    )
  );

  // Queue processing for each enrollment
  for (const enrollment of enrollments) {
    await workflowQueue.add("process-enrollment", {
      enrollmentId: enrollment.id,
      workflowId: id,
    });
  }

  return NextResponse.json({ enrolled: enrollments.length });
}
