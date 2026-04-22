import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const campaign = await prisma.campaign.findFirst({ where: { id, userId: session.user.id } });
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { followUpWorkflowId, followUpTrigger } = await req.json();

  const updated = await (prisma.campaign as never as {
    update: (args: object) => Promise<unknown>
  }).update({
    where: { id },
    data: {
      followUpWorkflowId: followUpWorkflowId ?? null,
      followUpTrigger: followUpTrigger ?? null,
    },
  });

  return NextResponse.json(updated);
}
