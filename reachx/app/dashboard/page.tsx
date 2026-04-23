import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Sidebar } from "@/components/sidebar";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const campaigns = await prisma.campaign.findMany({
    where: { userId: session.user.id },
    include: { events: true, _count: { select: { recipients: true } } },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Workflow stats
  const [wfTotal, wfActive, wfEnrollActive, wfEnrollCompleted] = await Promise.all([
    prisma.workflow.count({ where: { userId: session.user.id, archived: false } }),
    prisma.workflow.count({ where: { userId: session.user.id, status: "ACTIVE", archived: false } }),
    prisma.workflowEnrollment.count({ where: { workflow: { userId: session.user.id }, status: "ACTIVE" } }),
    prisma.workflowEnrollment.count({ where: { workflow: { userId: session.user.id }, status: "COMPLETED" } }),
  ]);
  const totalEnrollments = wfEnrollActive + wfEnrollCompleted;
  const completionRate = totalEnrollments > 0 ? Math.round((wfEnrollCompleted / totalEnrollments) * 100) : null;

  type Campaign = (typeof campaigns)[0];
  type Ev = Campaign["events"][0];
  const cnt = (events: Ev[], type: string) =>
    events.filter((e) => e.eventType === type).length;

  const totalSent    = campaigns.reduce((a: number, c: Campaign) => a + cnt(c.events, "SENT"), 0);
  const totalOpened  = campaigns.reduce((a: number, c: Campaign) => a + cnt(c.events, "OPENED"), 0);
  const totalClicked = campaigns.reduce((a: number, c: Campaign) => a + cnt(c.events, "CLICKED"), 0);
  const openRate  = totalSent > 0 ? ((totalOpened  / totalSent) * 100).toFixed(1) : null;
  const clickRate = totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(1) : null;
  const name = session.user?.name ?? session.user?.email?.split("@")[0] ?? "there";

  const STATUS_STYLE: Record<string, string> = {
    DRAFT:   "text-slate-500 bg-slate-100 border-slate-200",
    SENDING: "text-amber-600 bg-amber-50 border-amber-200",
    SENT:    "text-emerald-600 bg-emerald-50 border-emerald-200",
    FAILED:  "text-rose-600 bg-rose-50 border-rose-200",
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar email={session.user?.email ?? ""} />
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-8 py-8 space-y-7">

          {/* Header */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest mb-1">Dashboard</p>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Good to see you, <span className="text-indigo-600">{name}</span>
              </h1>
            </div>
            <Link href="/dashboard/campaigns/new">
              <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm hover:-translate-y-px">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                New Campaign
              </button>
            </Link>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Campaigns",   value: String(campaigns.length),                    sub: "total created",          color: "text-indigo-600", iconBg: "bg-indigo-50 border-indigo-100",   bar: "bg-indigo-500",  barW: Math.min(campaigns.length * 10, 100) },
              { label: "Emails Sent", value: totalSent.toLocaleString(),                  sub: "all time",               color: "text-sky-600",    iconBg: "bg-sky-50 border-sky-100",         bar: "bg-sky-500",     barW: Math.min(totalSent, 100) },
              { label: "Open Rate",   value: openRate  ? `${openRate}%`  : "—",           sub: "avg. across campaigns",  color: "text-violet-600", iconBg: "bg-violet-50 border-violet-100",   bar: "bg-violet-500",  barW: openRate  ? Math.min(parseFloat(openRate),  100) : 0 },
              { label: "Click Rate",  value: clickRate ? `${clickRate}%` : "—",           sub: "avg. across campaigns",  color: "text-emerald-600",iconBg: "bg-emerald-50 border-emerald-100", bar: "bg-emerald-500", barW: clickRate ? Math.min(parseFloat(clickRate), 100) : 0 },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 hover:border-slate-300 hover:shadow-sm transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{s.label}</span>
                  <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${s.iconBg} ${s.color}`} />
                </div>
                <div>
                  <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-slate-400 mt-1">{s.sub}</div>
                </div>
                <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${s.bar} rounded-full stat-bar`} style={{ width: `${s.barW}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { title: "New Campaign",    desc: "Create and send an email campaign", href: "/dashboard/campaigns/new", color: "text-indigo-600",  bg: "bg-indigo-50 border-indigo-100" },
              { title: "Validate Emails", desc: "Check a list before sending",       href: "/dashboard/validate",      color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
              { title: "View Analytics",  desc: "Deep dive into performance",        href: "/dashboard/analytics",     color: "text-violet-600",  bg: "bg-violet-50 border-violet-100" },
            ].map((a) => (
              <Link key={a.title} href={a.href} className="group flex items-center gap-4 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl p-4 transition-all hover:shadow-sm">
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${a.bg} ${a.color}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-800">{a.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{a.desc}</div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all shrink-0">
                  <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                </svg>
              </Link>
            ))}
          </div>

          {/* Workflow stats widget */}
          {wfTotal > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 hover:border-slate-300 hover:shadow-sm transition-all">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Automation</p>
                <Link href="/dashboard/workflows" className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
                  View all →
                </Link>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Workflows",  value: wfTotal,          color: "text-slate-800" },
                  { label: "Active",     value: wfActive,         color: "text-emerald-600" },
                  { label: "Enrolled",   value: wfEnrollActive,   color: "text-sky-600" },
                  { label: "Completion", value: completionRate != null ? `${completionRate}%` : "—", color: "text-violet-600" },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent campaigns */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Recent campaigns</p>
              <Link href="/dashboard/campaigns" className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
                View all →
              </Link>
            </div>

            {campaigns.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-14 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto mb-4">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <p className="text-slate-700 font-semibold mb-1">No campaigns yet</p>
                <p className="text-slate-400 text-sm mb-5">Create your first campaign to get started.</p>
                <Link href="/dashboard/campaigns/new">
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all">
                    Create campaign →
                  </button>
                </Link>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      {["Campaign", "Status", "Recipients", "Sent", "Opened"].map((h, i) => (
                        <th key={h} className={`px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider ${i === 0 ? "text-left" : "text-right"}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {campaigns.map((c: Campaign) => (
                      <tr key={c.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-5 py-4">
                          <Link href={`/dashboard/campaigns/${c.id}`} className="font-medium text-slate-800 group-hover:text-indigo-600 transition-colors text-sm">
                            {c.name}
                          </Link>
                          <div className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{c.subject}</div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className={`inline-flex items-center text-[11px] px-2.5 py-1 rounded-full font-semibold border ${STATUS_STYLE[c.status]}`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right text-sm text-slate-500">{c._count.recipients}</td>
                        <td className="px-5 py-4 text-right text-sm text-slate-500">{cnt(c.events, "SENT")}</td>
                        <td className="px-5 py-4 text-right text-sm text-slate-500">{cnt(c.events, "OPENED")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
