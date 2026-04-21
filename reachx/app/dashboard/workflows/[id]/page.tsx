import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/sidebar";
import { WorkflowBuilder } from "./workflow-builder";

export default async function WorkflowPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;
  const workflow = await prisma.workflow.findFirst({
    where: { id, userId: session.user.id },
    include: { steps: { orderBy: { order: "asc" } } },
  });
  if (!workflow) redirect("/dashboard/workflows");

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar email={session.user?.email ?? ""} />
      <WorkflowBuilder workflow={JSON.parse(JSON.stringify(workflow))} />
    </div>
  );
}
