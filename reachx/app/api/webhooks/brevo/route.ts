import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EventType } from "@prisma/client";

// Map Brevo event names → our EventType enum
const EVENT_MAP: Record<string, EventType> = {
  delivered:    "SENT",
  hard_bounce:  "BOUNCED",
  soft_bounce:  "BOUNCED",
  spam:         "SPAM",
  opened:       "OPENED",
  click:        "CLICKED",
  unsubscribed: "UNSUBSCRIBED",
};

// POST /api/webhooks/brevo
// Configure this URL in Brevo → Transactional → Webhooks
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event = body.event as string;
  const email = body.email as string;
  const messageId = body["message-id"] as string | undefined;
  const link = body.link as string | undefined; // present on click events

  const eventType = EVENT_MAP[event];
  if (!eventType || !email) return NextResponse.json({ ok: true });

  // Find the most recent recipient with this email that has a SENT event
  // (Brevo doesn't send back our internal IDs, so we match by email)
  const recipient = await prisma.recipient.findFirst({
    where: { email },
    orderBy: { createdAt: "desc" },
  });

  if (recipient) {
    // Deduplicate opens
    if (eventType === "OPENED") {
      const existing = await prisma.emailEvent.findFirst({
        where: { recipientId: recipient.id, campaignId: recipient.campaignId, eventType: "OPENED" },
      });
      if (existing) return NextResponse.json({ ok: true });
    }

    await prisma.emailEvent.create({
      data: {
        eventType,
        campaignId: recipient.campaignId,
        recipientId: recipient.id,
        metadata: { messageId, ...(link ? { url: link } : {}) },
      },
    });

    // Handle unsubscribe — mark contact + exit workflows
    if (eventType === "UNSUBSCRIBED" || eventType === "SPAM") {
      const campaign = await prisma.campaign.findUnique({
        where: { id: recipient.campaignId },
        select: { userId: true },
      });
      if (campaign) {
        await prisma.contact.updateMany({
          where: { email, userId: campaign.userId },
          data: { unsubscribed: true, ...(eventType === "SPAM" ? { spamAt: new Date() } : {}) },
        });
        // Exit active workflow enrollments
        const enrollments = await prisma.workflowEnrollment.findMany({
          where: { contactEmail: email, status: "ACTIVE" },
          include: { workflow: { select: { exitOnUnsubscribe: true } } },
        });
        for (const e of enrollments) {
          if (e.workflow.exitOnUnsubscribe) {
            await prisma.workflowEnrollment.update({
              where: { id: e.id },
              data: { status: "PAUSED" },
            });
          }
        }
      }
    }

    // Handle bounce — record on contact
    if (eventType === "BOUNCED") {
      const campaign = await prisma.campaign.findUnique({
        where: { id: recipient.campaignId },
        select: { userId: true },
      });
      if (campaign) {
        await prisma.contact.updateMany({
          where: { email, userId: campaign.userId },
          data: { bouncedAt: new Date() },
        });
      }
    }
  }

  return NextResponse.json({ ok: true });
}
