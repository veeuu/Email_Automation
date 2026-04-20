import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const campaigns = await prisma.campaign.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { recipients: true, events: true } },
    },
  });
  return NextResponse.json(campaigns);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, subject, content, recipients } = await req.json();
  if (!name || !subject || !content) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const campaign = await prisma.campaign.create({
    data: {
      name,
      subject,
      content,
      userId: session.user.id,
      recipients: {
        create: (recipients as string[]).map((email: string) => ({ email })),
      },
    },
  });

  return NextResponse.json(campaign, { status: 201 });
}
