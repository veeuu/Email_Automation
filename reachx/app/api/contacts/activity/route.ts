import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const email = req.nextUrl.searchParams.get("email");
  if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

  const decodedEmail = decodeURIComponent(email);

  const contact = await prisma.contact.findFirst({
    where: { email: decodedEmail, userId: session.user.id },
  });

  const emailEvents = await prisma.emailEvent.findMany({
    where: {
      recipient: { email: decodedEmail },
      campaign: { userId: session.user.id },
    },
    include: { campaign: { select: { id: true, name: true, subject: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const enrollments = await prisma.workflowEnrollment.findMany({
    where: { contactEmail: decodedEmail, workflow: { userId: session.user.id } },
    include: {
      workflow: { select: { id: true, name: true } },
      events: { orderBy: { createdAt: "desc" }, take: 5 },
    },
    orderBy: { enrolledAt: "desc" },
  });

  return NextResponse.json({ contact, emailEvents, enrollments });
}
