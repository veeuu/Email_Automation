import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const wf = await prisma.workflow.findFirst({
    where: { id, userId: session.user.id },
    include: { steps: true },
  });
  if (!wf) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [total, active, completed, failed] = await Promise.all([
    prisma.workflowEnrollment.count({ where: { workflowId: id } }),
    prisma.workflowEnrollment.count({ where: { workflowId: id, status: "ACTIVE" } }),
    prisma.workflowEnrollment.count({ where: { workflowId: id, status: "COMPLETED" } }),
    prisma.workflowEnrollment.count({ where: { workflowId: id, status: "FAILED" } }),
  ]);

  // Step-level funnel: count how many enrollments reached each step
  const stepFunnel = await Promise.all(
    wf.steps.map(async (step) => {
      const reached = await prisma.workflowEnrollmentEvent.count({
        where: { stepId: step.id },
      });
      return { stepId: step.id, stepType: step.type, reached };
    })
  );

  // Email stats from enrollment events
  const emailSent    = await prisma.workflowEnrollmentEvent.count({ where: { enrollment: { workflowId: id }, eventType: "EMAIL_SENT" } });
  const emailOpened  = await prisma.workflowEnrollmentEvent.count({ where: { enrollment: { workflowId: id }, eventType: "EMAIL_OPENED" } });
  const emailClicked = await prisma.workflowEnrollmentEvent.count({ where: { enrollment: { workflowId: id }, eventType: "EMAIL_CLICKED" } });

  // Recent activity log
  const activity = await prisma.workflowEnrollmentEvent.findMany({
    where: { enrollment: { workflowId: id } },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { enrollment: { select: { contactEmail: true } } },
  });

  return NextResponse.json({
    total, active, completed, failed,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    emailSent, emailOpened, emailClicked,
    openRate: emailSent > 0 ? Math.round((emailOpened / emailSent) * 100) : 0,
    clickRate: emailSent > 0 ? Math.round((emailClicked / emailSent) * 100) : 0,
    stepFunnel,
    activity,
  });
}
