import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/sidebar";
import { WorkflowsClient } from "./workflows-client";

export default async function WorkflowsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const workflows = await prisma.workflow.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { steps: true, enrollments: true } } },
  });

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar email={session.user?.email ?? ""} />
      <WorkflowsClient workflows={JSON.parse(JSON.stringify(workflows))} />
    </div>
  );
}
