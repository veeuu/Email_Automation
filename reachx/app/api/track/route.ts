import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { workflowQueue } from "@/lib/workflowQueue";
import { triggerWorkflows } from "@/lib/triggerWorkflows";

// GET /api/track?rid=<recipientId>&cid=<campaignId>&type=open|click&url=<encodedUrl>
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const recipientId = searchParams.get("rid");
  const campaignId = searchParams.get("cid");
  const type = searchParams.get("type"); // "open" | "click"
  const url = searchParams.get("url");

  if (recipientId && campaignId) {
    try {
      const eventType = type === "click" ? "CLICKED" : "OPENED";

      // Deduplicate opens — only record first open per recipient
      if (eventType === "OPENED") {
        const existing = await prisma.emailEvent.findFirst({
          where: { recipientId, campaignId, eventType: "OPENED" },
        });
        if (!existing) {
          await prisma.emailEvent.create({
            data: { eventType: "OPENED", campaignId, recipientId },
          });
          // Fire follow-up workflow (per-campaign config)
          await triggerFollowUpWorkflow(campaignId, recipientId, "opened");
          // Fire any CAMPAIGN_OPENED trigger workflows for this user
          const recipient = await prisma.recipient.findUnique({ where: { id: recipientId } });
          if (recipient) {
            const campaign = await prisma.campaign.findUnique({
              where: { id: campaignId },
              select: { userId: true },
            });
            if (campaign) {
              triggerWorkflows(campaign.userId, "CAMPAIGN_OPENED", recipient.email, { campaignId }).catch(() => {});
            }
          }
        }
      } else if (eventType === "CLICKED") {
        await prisma.emailEvent.create({
          data: {
            eventType: "CLICKED",
            campaignId,
            recipientId,
            metadata: url ? { url: decodeURIComponent(url) } : undefined,
          },
        });
        // Fire follow-up workflow (per-campaign config)
        await triggerFollowUpWorkflow(campaignId, recipientId, "clicked");
        // Fire any CAMPAIGN_CLICKED trigger workflows for this user
        const recipient = await prisma.recipient.findUnique({ where: { id: recipientId } });
        if (recipient) {
          const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId },
            select: { userId: true },
          });
          if (campaign) {
            triggerWorkflows(campaign.userId, "CAMPAIGN_CLICKED", recipient.email, { campaignId }).catch(() => {});
          }
        }
      }
    } catch {
      // Never fail a tracking request — silently ignore DB errors
    }
  }

  if (type === "click" && url) {
    return NextResponse.redirect(decodeURIComponent(url));
  }

  // Return 1x1 transparent GIF for open tracking
  const pixel = Buffer.from(
    "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
    "base64"
  );
  return new NextResponse(pixel, {
    headers: { "Content-Type": "image/gif", "Cache-Control": "no-store, no-cache, must-revalidate" },
  });
}

/**
 * If the campaign has a follow-up workflow with a matching trigger,
 * enroll the recipient into it now that the event has fired.
 */
async function triggerFollowUpWorkflow(
  campaignId: string,
  recipientId: string,
  event: "opened" | "clicked"
) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    select: { followUpWorkflowId: true, followUpTrigger: true },
  });
  if (!campaign?.followUpWorkflowId) return;

  const trigger = campaign.followUpTrigger ?? "all";
  // Only fire for matching event-based triggers
  if (trigger !== event) return;

  const recipient = await prisma.recipient.findUnique({ where: { id: recipientId } });
  if (!recipient) return;

  const workflow = await prisma.workflow.findFirst({
    where: { id: campaign.followUpWorkflowId, status: "ACTIVE" },
    include: { steps: { orderBy: { order: "asc" } } },
  });
  if (!workflow) return;

  const firstStep = workflow.steps.find((s) => s.type === "TRIGGER") ?? workflow.steps[0];

  const enrollment = await prisma.workflowEnrollment.upsert({
    where: { workflowId_contactEmail: { workflowId: workflow.id, contactEmail: recipient.email } },
    create: { workflowId: workflow.id, contactEmail: recipient.email, currentStepId: firstStep?.id },
    update: workflow.allowReEnrollment
      ? { status: "ACTIVE", currentStepId: firstStep?.id }
      : {},
  });

  if (enrollment.status === "ACTIVE") {
    await workflowQueue.add("process-enrollment", {
      enrollmentId: enrollment.id,
      workflowId: workflow.id,
    });
  }
}
