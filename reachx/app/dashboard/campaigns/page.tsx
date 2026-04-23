import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/sidebar";
import { CampaignsClient } from "./campaigns-client";

export default async function CampaignsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const campaigns = await prisma.campaign.findMany({
    where: { userId: session.user.id },
    include: { events: true, _count: { select: { recipients: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar email={session.user?.email ?? ""} />
      <CampaignsClient campaigns={JSON.parse(JSON.stringify(campaigns))} />
    </div>
  );
}
