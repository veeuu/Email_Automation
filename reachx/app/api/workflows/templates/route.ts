import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const TEMPLATES = [
  {
    id: "welcome-series",
    name: "Welcome Series",
    description: "3-email onboarding sequence for new contacts",
    triggerType: "CONTACT_CREATED",
    steps: [
      { type: "TRIGGER", config: { label: "CONTACT_CREATED" }, order: 0, parentId: null, branch: null },
      { type: "SEND_EMAIL", config: { subject: "Welcome to {{company}}!", htmlContent: "<p>Hi {{name}},</p><p>Welcome aboard! We're excited to have you.</p>" }, order: 1, parentId: "__t0__", branch: null },
      { type: "WAIT", config: { delayMinutes: 1440 }, order: 2, parentId: "__t1__", branch: null },
      { type: "SEND_EMAIL", config: { subject: "Getting started guide", htmlContent: "<p>Here are a few tips to get started...</p>" }, order: 3, parentId: "__t2__", branch: null },
      { type: "WAIT", config: { delayMinutes: 2880 }, order: 4, parentId: "__t3__", branch: null },
      { type: "SEND_EMAIL", config: { subject: "How's it going?", htmlContent: "<p>Just checking in — let us know if you need anything.</p>" }, order: 5, parentId: "__t4__", branch: null },
      { type: "END", config: {}, order: 6, parentId: "__t5__", branch: null },
    ],
  },
  {
    id: "re-engagement",
    name: "Re-engagement",
    description: "Win back inactive contacts with a targeted sequence",
    triggerType: "MANUAL",
    steps: [
      { type: "TRIGGER", config: { label: "MANUAL" }, order: 0, parentId: null, branch: null },
      { type: "SEND_EMAIL", config: { subject: "We miss you!", htmlContent: "<p>Hi {{name}},</p><p>It's been a while. Here's what's new...</p>" }, order: 1, parentId: "__t0__", branch: null },
      { type: "WAIT", config: { delayMinutes: 4320 }, order: 2, parentId: "__t1__", branch: null },
      { type: "IF_CONDITION", config: { field: "tag", operator: "includes", value: "re-engaged" }, order: 3, parentId: "__t2__", branch: null },
      { type: "UPDATE_TAG", config: { tags: ["active"] }, order: 4, parentId: "__t3__", branch: "yes" },
      { type: "END", config: {}, order: 5, parentId: "__t4__", branch: null },
      { type: "SEND_EMAIL", config: { subject: "Last chance — special offer inside", htmlContent: "<p>We'd love to have you back. Here's an exclusive offer...</p>" }, order: 6, parentId: "__t3__", branch: "no" },
      { type: "END", config: {}, order: 7, parentId: "__t6__", branch: null },
    ],
  },
  {
    id: "lead-nurture",
    name: "Lead Nurture",
    description: "Educate and qualify leads over time",
    triggerType: "TAG_ADDED",
    steps: [
      { type: "TRIGGER", config: { label: "TAG_ADDED" }, order: 0, parentId: null, branch: null },
      { type: "SEND_EMAIL", config: { subject: "Thanks for your interest", htmlContent: "<p>Hi {{name}},</p><p>Here's a resource to help you get started...</p>" }, order: 1, parentId: "__t0__", branch: null },
      { type: "WAIT", config: { delayMinutes: 2880 }, order: 2, parentId: "__t1__", branch: null },
      { type: "SEND_EMAIL", config: { subject: "Case study: How others succeeded", htmlContent: "<p>See how our customers achieved results...</p>" }, order: 3, parentId: "__t2__", branch: null },
      { type: "WAIT", config: { delayMinutes: 2880 }, order: 4, parentId: "__t3__", branch: null },
      { type: "UPDATE_TAG", config: { tags: ["nurtured"] }, order: 5, parentId: "__t4__", branch: null },
      { type: "SEND_EMAIL", config: { subject: "Ready to take the next step?", htmlContent: "<p>You've been learning a lot. Let's talk about how we can help.</p>" }, order: 6, parentId: "__t5__", branch: null },
      { type: "END", config: {}, order: 7, parentId: "__t6__", branch: null },
    ],
  },
];

export async function GET() {
  return NextResponse.json(TEMPLATES.map(({ id, name, description, triggerType }) => ({ id, name, description, triggerType })));
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { templateId } = await req.json();
  const template = TEMPLATES.find((t) => t.id === templateId);
  if (!template) return NextResponse.json({ error: "Template not found" }, { status: 404 });

  // Resolve __t0__, __t1__... placeholder parentIds to real cuid-like ids
  const ids = template.steps.map(() => Math.random().toString(36).slice(2, 10));
  const resolveParent = (p: string | null) => {
    if (!p) return null;
    const match = p.match(/__t(\d+)__/);
    if (match) return ids[parseInt(match[1])];
    return null;
  };

  const workflow = await prisma.workflow.create({
    data: {
      name: template.name,
      triggerType: template.triggerType as never,
      userId: session.user.id,
      steps: {
        create: template.steps.map((s, i) => ({
          id: ids[i],
          type: s.type as never,
          config: s.config,
          order: s.order,
          parentId: resolveParent(s.parentId),
          branch: s.branch,
        })),
      },
    },
  });

  return NextResponse.json(workflow, { status: 201 });
}
