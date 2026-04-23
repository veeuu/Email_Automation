import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { name, subject, content, fromName, replyTo } = await req.json();

  const campaign = await prisma.campaign.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found or already sent" }, { status: 404 });
  }

  const updated = await prisma.campaign.update({
    where: { id },
    data: {
      name,
      subject,
      content,
      ...(fromName !== undefined && { fromName: fromName || null }),
      ...(replyTo !== undefined && { replyTo: replyTo || null }),
    },
  });

  return NextResponse.json(updated);
}
