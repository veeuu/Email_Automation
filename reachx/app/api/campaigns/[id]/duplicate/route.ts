import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const source = await prisma.campaign.findFirst({
    where: { id, userId: session.user.id },
    include: { recipients: true },
  });
  if (!source) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const copy = await prisma.campaign.create({
    data: {
      name: `${source.name} (copy)`,
      subject: source.subject,
      content: source.content,
      userId: session.user.id,
      // Copy recipients as fresh PENDING entries
      recipients: {
        create: source.recipients.map((r) => ({ email: r.email })),
      },
    },
  });

  return NextResponse.json(copy, { status: 201 });
}
