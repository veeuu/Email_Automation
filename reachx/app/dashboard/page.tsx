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
    DRAFT: "text-slate-600 bg-slate-100",
    SENDING: "text-amber-700 bg-amber-100",
    SENT: "text-emerald-700 bg-emerald-100",
    FAILED: "text-rose-700 bg-rose-100",
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar email={session.user?.email ?? ""} />
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-8 py-10 space-y-10">
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Welcome back, {name} 👋
            </h1>
            <p className="text-slate-500">Here's what's happening with your campaigns.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: "Campaigns", value: String(campaigns.length), sub: "total", icon: "📧", gradient: "from-indigo-500 to-purple-500" },
              { label: "Emails Sent", value: String(totalSent), sub: "all time", icon: "📤", gradient: "from-blue-500 to-cyan-500" },
              { label: "Open Rate", value: openRate, sub: "average", icon: "👁", gradient: "from-emerald-500 to-teal-500" },
              { label: "Click Rate", value: clickRate, sub: "average", icon: "🖱", gradient: "from-orange-500 to-amber-500" },
            ].map((s) => (
              <div key={s.label} className="group relative bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-0.5 transition-all duration-200">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{s.icon}</span>
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${s.gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
                </div>
                <div className={`text-3xl font-bold bg-gradient-to-br ${s.gradient} bg-clip-text text-transparent`}>
                  {s.value}
                </div>
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">{s.label}</div>
                <div className="text-xs text-slate-400 mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: "New Campaign", desc: "Create and send an email campaign", href: "/dashboard/campaigns/new", icon: "✨", color: "indigo" },
                { title: "Validate Emails", desc: "Check a list before sending", href: "/validate", icon: "✓", color: "emerald" },
                { title: "View Analytics", desc: "Deep dive into performance", href: "/dashboard/analytics", icon: "📊", color: "blue" },
              ].map((a) => (
                <Link
                  key={a.title}
                  href={a.href}
                  className="group relative bg-white border border-slate-200 rounded-2xl p-6 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/50 transition-all duration-200 overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-${a.color}-500/5 to-${a.color}-600/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`} />
                  <div className="relative space-y-2">
                    <div className="text-2xl">{a.icon}</div>
                    <div className="font-semibold text-slate-900">{a.title}</div>
                    <div className="text-sm text-slate-500">{a.desc}</div>
                    <div className="text-xs font-medium text-indigo-600 group-hover:text-indigo-700 flex items-center gap-1 pt-1">
                      Go <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Campaigns */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Recent Campaigns</h2>
              <Link href="/dashboard/campaigns" className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
                View all →
              </Link>
            </div>

            {campaigns.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-16 text-center">
                <div className="text-5xl mb-4">📭</div>
                <p className="text-slate-500 font-medium mb-4">No campaigns yet</p>
                <Link href="/dashboard/campaigns/new">
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/30 transition-all">
                    Create your first campaign →
                  </button>
                </Link>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50">
                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Campaign</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                        <th className="text-right px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Recipients</th>
                        <th className="text-right px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Sent</th>
                        <th className="text-right px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Opened</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {campaigns.map((c: Campaign) => (
                        <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <Link href={`/dashboard/campaigns/${c.id}`} className="font-medium text-slate-900 hover:text-indigo-600 transition-colors">
                              {c.name}
                            </Link>
                            <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">{c.subject}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLE[c.status]}`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-sm text-slate-600 font-medium">{c._count.recipients}</td>
                          <td className="px-6 py-4 text-right text-sm text-slate-600 font-medium">{cnt(c.events, "SENT")}</td>
                          <td className="px-6 py-4 text-right text-sm text-slate-600 font-medium">{cnt(c.events, "OPENED")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
