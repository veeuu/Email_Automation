import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/sidebar";

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const campaigns = await prisma.campaign.findMany({
    where: { userId: session.user.id },
    include: { events: true, _count: { select: { recipients: true } } },
    orderBy: { createdAt: "desc" },
  });

  type Campaign = (typeof campaigns)[0];
  type Ev = Campaign["events"][0];
  const cnt = (events: Ev[], type: string) => events.filter((e) => e.eventType === type).length;

  const totalSent    = campaigns.reduce((acc: number, c: Campaign) => acc + cnt(c.events, "SENT"), 0);
  const totalOpened  = campaigns.reduce((acc: number, c: Campaign) => acc + cnt(c.events, "OPENED"), 0);
  const totalClicked = campaigns.reduce((acc: number, c: Campaign) => acc + cnt(c.events, "CLICKED"), 0);
  const totalBounced = campaigns.reduce((acc: number, c: Campaign) => acc + cnt(c.events, "BOUNCED"), 0);

  const STATS = [
    { label: "Total Sent",    value: totalSent,    rate: null,                                                                          color: "text-sky-400",     icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> },
    { label: "Total Opened",  value: totalOpened,  rate: totalSent > 0 ? ((totalOpened  / totalSent) * 100).toFixed(1) + "%" : null,   color: "text-violet-400",  icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> },
    { label: "Total Clicked", value: totalClicked, rate: totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(1) + "%" : null,   color: "text-emerald-400", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
    { label: "Bounced",       value: totalBounced, rate: totalSent > 0 ? ((totalBounced / totalSent) * 100).toFixed(1) + "%" : null,   color: "text-rose-400",    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      <Sidebar email={session.user?.email ?? ""} />
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-8 py-10 space-y-8">

          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Analytics</h1>
            <p className="text-slate-500 text-sm mt-1">Aggregate performance across all campaigns.</p>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((s) => (
              <div key={s.label} className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
                <div className={`${s.color} mb-3`}>{s.icon}</div>
                <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs font-medium text-slate-400 mt-1">{s.label}</div>
                {s.rate && <div className="text-xs text-slate-600 mt-0.5">{s.rate} rate</div>}
              </div>
            ))}
          </div>

          {/* Per campaign table */}
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Per campaign</h2>
            {campaigns.length === 0 ? (
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-10 text-center text-slate-500 text-sm">
                No campaign data yet.
              </div>
            ) : (
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Campaign</th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Sent</th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Open rate</th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Click rate</th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Bounces</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {campaigns.map((c: Campaign) => {
                      const sent    = cnt(c.events, "SENT");
                      const opened  = cnt(c.events, "OPENED");
                      const clicked = cnt(c.events, "CLICKED");
                      const bounced = cnt(c.events, "BOUNCED");
                      return (
                        <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-5 py-4 font-medium text-white">{c.name}</td>
                          <td className="px-5 py-4 text-right text-slate-400">{sent}</td>
                          <td className="px-5 py-4 text-right font-medium text-violet-400">
                            {sent > 0 ? ((opened / sent) * 100).toFixed(1) + "%" : "—"}
                          </td>
                          <td className="px-5 py-4 text-right font-medium text-emerald-400">
                            {sent > 0 ? ((clicked / sent) * 100).toFixed(1) + "%" : "—"}
                          </td>
                          <td className="px-5 py-4 text-right text-rose-400">{bounced}</td>
                        </tr>
                      );
                    })}
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
