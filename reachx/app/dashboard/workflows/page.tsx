import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Sidebar } from "@/components/sidebar";

export default async function WorkflowsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const workflows = await prisma.workflow.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { steps: true, enrollments: true } } },
  });

  const STATUS_STYLE: Record<string, string> = {
    DRAFT:    "text-slate-500 bg-slate-100 border-slate-200",
    ACTIVE:   "text-emerald-600 bg-emerald-50 border-emerald-200",
    INACTIVE: "text-amber-600 bg-amber-50 border-amber-200",
  };

  const TRIGGER_LABEL: Record<string, string> = {
    MANUAL:           "Manual",
    CONTACT_CREATED:  "Contact created",
    TAG_ADDED:        "Tag added",
    CAMPAIGN_OPENED:  "Campaign opened",
    CAMPAIGN_CLICKED: "Campaign clicked",
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar email={session.user?.email ?? ""} />
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-8 py-8 space-y-7">

          <div className="flex items-center justify-between pt-1">
            <div>
              <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest mb-1">Automation</p>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Workflows</h1>
            </div>
            <Link href="/dashboard/workflows/new">
              <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm hover:-translate-y-px">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                New Workflow
              </button>
            </Link>
          </div>

          {workflows.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-16 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                  <path d="M5 12h14"/><circle cx="5" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
                  <circle cx="12" cy="5" r="2"/><circle cx="12" cy="19" r="2"/>
                  <path d="M12 7v3m0 4v3M7 12h3m4 0h3"/>
                </svg>
              </div>
              <p className="text-slate-700 font-semibold mb-1">No workflows yet</p>
              <p className="text-slate-400 text-sm mb-5">Build automated email sequences triggered by contact behavior.</p>
              <Link href="/dashboard/workflows/new">
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all">
                  Create workflow →
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-3">
              {workflows.map((wf) => (
                <Link key={wf.id} href={`/dashboard/workflows/${wf.id}`}>
                  <div className="bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm rounded-2xl px-6 py-4 flex items-center gap-5 transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-violet-600">
                        <path d="M5 12h14"/><circle cx="5" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
                        <circle cx="12" cy="5" r="2"/><path d="M12 7v5"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors text-sm">{wf.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{TRIGGER_LABEL[wf.triggerType] ?? wf.triggerType}</div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400 shrink-0">
                      <span>{wf._count.steps} steps</span>
                      <span>{wf._count.enrollments} enrolled</span>
                      <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold border ${STATUS_STYLE[wf.status]}`}>
                        {wf.status}
                      </span>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 group-hover:text-slate-500 transition-colors shrink-0">
                      <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
