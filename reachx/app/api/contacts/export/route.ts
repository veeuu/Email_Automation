import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contacts = await prisma.contact.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const header = "email,name,phone,company,tags,unsubscribed,createdAt";
  const rows = contacts.map((c) =>
    [
      c.email,
      c.name ?? "",
      c.phone ?? "",
      c.company ?? "",
      c.tags ?? "",
      c.unsubscribed ? "true" : "false",
      c.createdAt.toISOString(),
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  );

  const csv = [header, ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="contacts-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
