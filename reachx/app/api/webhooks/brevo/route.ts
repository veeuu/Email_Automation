import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EventType } from "@prisma/client";

const EVENT_MAP: Record<string, EventType> = {
  delivered: "SENT",
  hard_bounce: "BOUNCED",
  soft_bounce: "BOUNCED",
  spam: "SPAM",
};

// POST /api/webhooks/brevo
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { event, "message-id": messageId, email } = body;

  const eventType = EVENT_MAP[event];
  if (!eventType) return NextResponse.json({ ok: true });

  // Look up recipient by email to log the event
  const recipient = await prisma.recipient.findFirst({ where: { email } });
  if (recipient) {
    await prisma.emailEvent.create({
      data: {
        eventType,
        campaignId: recipient.campaignId,
        recipientId: recipient.id,
        metadata: { messageId },
      },
    });
  }

  return NextResponse.json({ ok: true });
}
