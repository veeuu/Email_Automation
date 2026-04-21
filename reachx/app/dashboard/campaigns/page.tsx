import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Sidebar } from "@/components/sidebar";

export default async function CampaignsPage() {
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

  const STATUS_STYLE: Record<string, string> = {
    DRAFT:   "text-slate-400 bg-slate-500/10 border-slate-500/20",
    SENDING: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    SENT:    "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    FAILED:  "text-rose-400 bg-rose-500/10 border-rose-500/20",
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      <Sidebar email={session.user?.email ?? ""} />
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-8 py-10 space-y-8">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Campaigns</h1>
              <p className="text-slate-500 text-sm mt-1">{campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""} total</p>
            </div>
            <Link href="/dashboard/campaigns/new">
              <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-indigo-900/40">
                + New Campaign
              </button>
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
              <p className="text-slate-400 font-medium mb-1">No campaigns yet</p>
              <p className="text-slate-600 text-sm mb-5">Create your first campaign to start sending.</p>
              <Link href="/dashboard/campaigns/new">
                <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-900/40 transition-all">
                  Create campaign →
                </button>
              </Link>
            </div>
          ) : (
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Campaign</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Recipients</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Sent</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Opened</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Clicked</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {campaigns.map((c: Campaign) => {
                    const sent = cnt(c.events, "SENT");
                    const opened = cnt(c.events, "OPENED");
                    const clicked = cnt(c.events, "CLICKED");
                    return (
                      <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-4">
                          <Link href={`/dashboard/campaigns/${c.id}`} className="font-medium text-white hover:text-indigo-300 transition-colors">
                            {c.name}
                          </Link>
                          <div className="text-xs text-slate-600 mt-0.5">{c.subject}</div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${STATUS_STYLE[c.status]}`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right text-slate-400">{c._count.recipients}</td>
                        <td className="px-5 py-4 text-right text-slate-400">{sent}</td>
                        <td className="px-5 py-4 text-right text-slate-400">
                          {opened}
                          {sent > 0 && <span className="text-slate-600 text-xs ml-1">({((opened / sent) * 100).toFixed(0)}%)</span>}
                        </td>
                        <td className="px-5 py-4 text-right text-slate-400">
                          {clicked}
                          {sent > 0 && <span className="text-slate-600 text-xs ml-1">({((clicked / sent) * 100).toFixed(0)}%)</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
