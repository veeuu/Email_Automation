import "dotenv/config";
import { Worker, Queue } from "bullmq";
import { connection } from "../lib/queue";
import { prisma } from "../lib/prisma";
import { sendEmail } from "../lib/brevo";

const workflowQueue = new Queue("workflow-process", { connection });

export const workflowWorker = new Worker(
  "workflow-process",
  async (job) => {
    const { enrollmentId } = job.data;

    const enrollment = await prisma.workflowEnrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        workflow: { include: { steps: { orderBy: { order: "asc" } } } },
      },
    });

    if (!enrollment || enrollment.status !== "ACTIVE") return;

    const steps = enrollment.workflow.steps;
    const currentStep = steps.find((s) => s.id === enrollment.currentStepId);
    if (!currentStep) {
      await prisma.workflowEnrollment.update({
        where: { id: enrollmentId },
        data: { status: "COMPLETED" },
      });
      return;
    }

    const cfg = (currentStep.config ?? {}) as Record<string, unknown>;

    switch (currentStep.type) {
      case "SEND_EMAIL": {
        const subject = (cfg.subject as string) ?? "(no subject)";
        const htmlContent = (cfg.htmlContent as string) ?? "";
        await sendEmail({ to: enrollment.contactEmail, subject, htmlContent });
        await prisma.workflowEnrollmentEvent.create({
          data: { enrollmentId, stepId: currentStep.id, eventType: "EMAIL_SENT" },
        });
        break;
      }

      case "WAIT": {
        const delayMs = ((cfg.delayMinutes as number) ?? 60) * 60 * 1000;
        // Re-queue after delay
        const nextStep = getNextStep(steps, currentStep.id, null);
        if (nextStep) {
          await prisma.workflowEnrollment.update({
            where: { id: enrollmentId },
            data: { currentStepId: nextStep.id },
          });
          await workflowQueue.add(
            "process-enrollment",
            { enrollmentId, workflowId: enrollment.workflowId },
            { delay: delayMs }
          );
        }
        return; // Don't continue synchronously
      }

      case "IF_CONDITION": {
        const conditionMet = await evaluateCondition(cfg, enrollment.contactEmail);
        const branch = conditionMet ? "yes" : "no";
        const nextStep = getNextStep(steps, currentStep.id, branch);
        if (nextStep) {
          await prisma.workflowEnrollment.update({
            where: { id: enrollmentId },
            data: { currentStepId: nextStep.id },
          });
          await workflowQueue.add("process-enrollment", { enrollmentId, workflowId: enrollment.workflowId });
        }
        return;
      }

      case "UPDATE_TAG": {
        const tags = (cfg.tags as string[]) ?? [];
        const contact = await prisma.contact.findFirst({
          where: { email: enrollment.contactEmail, userId: enrollment.workflow.userId },
        });
        if (contact) {
          const existing = contact.tags ? contact.tags.split(",").map((t) => t.trim()) : [];
          const merged = Array.from(new Set([...existing, ...tags])).join(", ");
          await prisma.contact.update({ where: { id: contact.id }, data: { tags: merged } });
        }
        await prisma.workflowEnrollmentEvent.create({
          data: { enrollmentId, stepId: currentStep.id, eventType: "TAG_UPDATED", metadata: { tags } },
        });
        break;
      }

      case "END": {
        await prisma.workflowEnrollment.update({
          where: { id: enrollmentId },
          data: { status: "COMPLETED" },
        });
        return;
      }
    }

    // Advance to next step
    const nextStep = getNextStep(steps, currentStep.id, null);
    if (nextStep) {
      await prisma.workflowEnrollment.update({
        where: { id: enrollmentId },
        data: { currentStepId: nextStep.id },
      });
      await workflowQueue.add("process-enrollment", { enrollmentId, workflowId: enrollment.workflowId });
    } else {
      await prisma.workflowEnrollment.update({
        where: { id: enrollmentId },
        data: { status: "COMPLETED" },
      });
    }
  },
  { connection, concurrency: 5 }
);

function getNextStep(
  steps: { id: string; parentId: string | null; branch: string | null; order: number }[],
  currentId: string,
  branch: string | null
) {
  return steps.find((s) => s.parentId === currentId && s.branch === branch) ?? null;
}

async function evaluateCondition(cfg: Record<string, unknown>, email: string): Promise<boolean> {
  const field = cfg.field as string;
  const operator = cfg.operator as string;
  const value = cfg.value as string;

  if (field === "tag") {
    const contact = await prisma.contact.findFirst({ where: { email } });
    if (!contact?.tags) return false;
    const tags = contact.tags.split(",").map((t) => t.trim().toLowerCase());
    if (operator === "includes") return tags.includes(value.toLowerCase());
    if (operator === "excludes") return !tags.includes(value.toLowerCase());
  }
  return false;
}

workflowWorker.on("failed", (job, err) => {
  console.error(`Workflow job ${job?.id} failed:`, err.message);
});
