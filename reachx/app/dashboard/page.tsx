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

  type Campaign = (typeof campaigns)[0];
  type Ev = Campaign["events"][0];
  const cnt = (events: Ev[], type: string) => events.filter((e) => e.eventType === type).length;

  const totalSent = campaigns.reduce((acc: number, c: Campaign) => acc + cnt(c.events, "SENT"), 0);
  const totalOpened = campaigns.reduce((acc: number, c: Campaign) => acc + cnt(c.events, "OPENED"), 0);
  const totalClicked = campaigns.reduce((acc: number, c: Campaign) => acc + cnt(c.events, "CLICKED"), 0);
  const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) + "%" : "—";
  const clickRate = totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(1) + "%" : "—";
  const name = session.user?.name ?? session.user?.email?.split("@")[0] ?? "there";

  const STATUS_STYLE: Record<string, string> = {
    DRAFT:   "text-slate-400 bg-slate-500/10 border-slate-500/20",
    SENDING: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    SENT:    "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    FAILED:  "text-rose-400 bg-rose-500/10 border-rose-500/20",
  };

  const STATS = [
    {
      label: "Campaigns",
      value: String(campaigns.length),
      sub: "total",
      color: "text-indigo-400",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
      ),
    },
    {
      label: "Emails Sent",
      value: String(totalSent),
      sub: "all time",
      color: "text-sky-400",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
      ),
    },
    {
      label: "Open Rate",
      value: openRate,
      sub: "average",
      color: "text-violet-400",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
        </svg>
      ),
    },
    {
      label: "Click Rate",
      value: clickRate,
      sub: "average",
      color: "text-emerald-400",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      <Sidebar email={session.user?.email ?? ""} />
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-8 py-10 space-y-10">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Good to see you, {name}
              </h1>
              <p className="text-slate-500 text-sm mt-1">Here&apos;s an overview of your campaigns.</p>
            </div>
            <Link href="/dashboard/campaigns/new">
              <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-indigo-900/40">
                + New Campaign
              </button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((s) => (
              <div key={s.label} className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 hover:bg-white/[0.05] transition-colors">
                <div className={`${s.color} mb-3`}>{s.icon}</div>
                <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs font-medium text-slate-400 mt-1">{s.label}</div>
                <div className="text-xs text-slate-600 mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Quick actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  title: "New Campaign",
                  desc: "Create and send an email campaign",
                  href: "/dashboard/campaigns/new",
                  color: "text-indigo-400",
                  bg: "bg-indigo-500/10 border-indigo-500/20",
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
                },
                {
                  title: "Validate Emails",
                  desc: "Check a list before sending",
                  href: "/dashboard/validate",
                  color: "text-emerald-400",
                  bg: "bg-emerald-500/10 border-emerald-500/20",
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
                },
                {
                  title: "View Analytics",
                  desc: "Deep dive into performance",
                  href: "/dashboard/analytics",
                  color: "text-violet-400",
                  bg: "bg-violet-500/10 border-violet-500/20",
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
                },
              ].map((a) => (
                <Link key={a.title} href={a.href}
                  className="group flex items-center gap-4 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 rounded-xl p-4 transition-all">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${a.bg} ${a.color}`}>
                    {a.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white">{a.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{a.desc}</div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all shrink-0">
                    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                  </svg>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Campaigns */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Recent campaigns</h2>
              <Link href="/dashboard/campaigns" className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                View all →
              </Link>
            </div>

            {campaigns.length === 0 ? (
              <div className="bg-white/[0.02] border border-dashed border-white/10 rounded-2xl p-16 text-center">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <p className="text-slate-500 font-medium mb-1">No campaigns yet</p>
                <p className="text-slate-600 text-sm mb-5">Create your first campaign to get started.</p>
                <Link href="/dashboard/campaigns/new">
                  <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-900/40 transition-all">
                    Create campaign →
                  </button>
                </Link>
              </div>
            ) : (
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Campaign</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Recipients</th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Sent</th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Opened</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {campaigns.map((c: Campaign) => (
                      <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-4">
                          <Link href={`/dashboard/campaigns/${c.id}`} className="font-medium text-white hover:text-indigo-300 transition-colors text-sm">
                            {c.name}
                          </Link>
                          <div className="text-xs text-slate-600 mt-0.5 truncate max-w-xs">{c.subject}</div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full font-medium border ${STATUS_STYLE[c.status]}`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right text-sm text-slate-400">{c._count.recipients}</td>
                        <td className="px-5 py-4 text-right text-sm text-slate-400">{cnt(c.events, "SENT")}</td>
                        <td className="px-5 py-4 text-right text-sm text-slate-400">{cnt(c.events, "OPENED")}</td>
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
