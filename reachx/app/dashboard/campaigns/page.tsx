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

          <div className="flex items-center justify-between pt-1">
            <div>
              <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest mb-1">Email</p>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Campaigns</h1>
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

          {campaigns.length > 0 && (
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Total",  value: campaigns.length,                                              color: "text-slate-800" },
                { label: "Draft",  value: campaigns.filter((c) => c.status === "DRAFT").length,          color: "text-slate-500" },
                { label: "Sent",   value: campaigns.filter((c) => c.status === "SENT").length,           color: "text-emerald-600" },
                { label: "Failed", value: campaigns.filter((c) => c.status === "FAILED").length,         color: "text-rose-500" },
              ].map((s) => (
                <div key={s.label} className="bg-white border border-slate-200 rounded-xl px-4 py-3.5 hover:shadow-sm transition-all">
                  <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {campaigns.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-16 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <p className="text-slate-700 font-semibold mb-1">No campaigns yet</p>
              <p className="text-slate-400 text-sm mb-5">Create your first campaign to start sending.</p>
              <Link href="/dashboard/campaigns/new">
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all">
                  Create campaign →
                </button>
              </Link>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {["Campaign", "Status", "Recipients", "Sent", "Opened", "Clicked"].map((h, i) => (
                      <th key={h} className={`px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider ${i === 0 ? "text-left" : "text-right"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {campaigns.map((c: Campaign) => {
                    const sent    = cnt(c.events, "SENT");
                    const opened  = cnt(c.events, "OPENED");
                    const clicked = cnt(c.events, "CLICKED");
                    return (
                      <tr key={c.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-5 py-4">
                          <Link href={`/dashboard/campaigns/${c.id}`} className="font-medium text-slate-800 group-hover:text-indigo-600 transition-colors">
                            {c.name}
                          </Link>
                          <div className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{c.subject}</div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold border ${STATUS_STYLE[c.status]}`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right text-slate-500">{c._count.recipients}</td>
                        <td className="px-5 py-4 text-right text-slate-500">{sent}</td>
                        <td className="px-5 py-4 text-right text-slate-500">
                          {opened}
                          {sent > 0 && <span className="text-slate-300 text-xs ml-1">({((opened / sent) * 100).toFixed(0)}%)</span>}
                        </td>
                        <td className="px-5 py-4 text-right text-slate-500">
                          {clicked}
                          {sent > 0 && <span className="text-slate-300 text-xs ml-1">({((clicked / sent) * 100).toFixed(0)}%)</span>}
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
