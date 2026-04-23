/**
 * triggerWorkflows — fires all ACTIVE workflows for a given user + trigger type.
 * Called from API routes when the triggering event occurs.
 */

import { prisma } from "./prisma";
import { workflowQueue } from "./workflowQueue";
import { TriggerType } from "@prisma/client";

export async function triggerWorkflows(
  userId: string,
  triggerType: TriggerType,
  contactEmail: string,
  /** Optional extra filter — e.g. tag value for TAG_ADDED */
  meta?: { tag?: string; campaignId?: string }
) {
  const workflows = await prisma.workflow.findMany({
    where: { userId, status: "ACTIVE", triggerType, archived: false },
    include: { steps: { orderBy: { order: "asc" } } },
  });

  for (const wf of workflows) {
    const cfg = (wf.triggerConfig ?? {}) as Record<string, unknown>;

    // For TAG_ADDED, only fire if the tag matches the workflow's configured tag filter (if any)
    if (triggerType === "TAG_ADDED" && cfg.tag && meta?.tag) {
      if ((cfg.tag as string).toLowerCase() !== meta.tag.toLowerCase()) continue;
    }

    // For CAMPAIGN_OPENED / CAMPAIGN_CLICKED, only fire if campaignId matches (if configured)
    if (
      (triggerType === "CAMPAIGN_OPENED" || triggerType === "CAMPAIGN_CLICKED") &&
      cfg.campaignId &&
      meta?.campaignId
    ) {
      if (cfg.campaignId !== meta.campaignId) continue;
    }

    const firstStep = wf.steps.find((s) => s.type === "TRIGGER") ?? wf.steps[0];
    if (!firstStep) continue;

    try {
      const enrollment = await prisma.workflowEnrollment.upsert({
        where: { workflowId_contactEmail: { workflowId: wf.id, contactEmail } },
        create: { workflowId: wf.id, contactEmail, currentStepId: firstStep.id },
        update: wf.allowReEnrollment
          ? { status: "ACTIVE", currentStepId: firstStep.id }
          : {},
      });

      if (enrollment.status === "ACTIVE") {
        await workflowQueue.add("process-enrollment", {
          enrollmentId: enrollment.id,
          workflowId: wf.id,
        });
      }
    } catch {
      // Ignore duplicate enrollment conflicts
    }
  }
}
