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

  const STATUS_COLOR: Record<string, string> = {
    DRAFT: "text-gray-400 bg-gray-500/10",
    SENDING: "text-amber-400 bg-amber-500/10",
    SENT: "text-emerald-400 bg-emerald-500/10",
    FAILED: "text-rose-400 bg-rose-500/10",
  };

  return (
    <div className="min-h-screen bg-[#080b14] text-white flex">
      <Sidebar email={session.user?.email ?? ""} />
      <main className="flex-1 overflow-auto p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Campaigns</h1>
              <p className="text-gray-500 text-sm mt-1">{campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""} total</p>
            </div>
            <Link href="/dashboard/campaigns/new">
              <button className="bg-violet-600 hover:bg-violet-500 transition-colors px-4 py-2 rounded-lg text-sm font-semibold">
                + New Campaign
              </button>
            </Link>
          </div>

          {campaigns.length === 0 ? (
            <div className="bg-[#0e1120] border border-white/8 rounded-xl p-12 text-center">
              <p className="text-gray-600">No campaigns yet.</p>
              <Link href="/dashboard/campaigns/new">
                <button className="mt-4 bg-violet-600 hover:bg-violet-500 transition-colors px-4 py-2 rounded-lg text-sm font-medium">
                  Create your first campaign →
                </button>
              </Link>
            </div>
          ) : (
            <div className="bg-[#0e1120] border border-white/8 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-xs text-gray-500 uppercase tracking-wider">
                    <th className="text-left px-5 py-3">Campaign</th>
                    <th className="text-left px-5 py-3">Status</th>
                    <th className="text-right px-5 py-3">Recipients</th>
                    <th className="text-right px-5 py-3">Sent</th>
                    <th className="text-right px-5 py-3">Opened</th>
                    <th className="text-right px-5 py-3">Clicked</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c: Campaign) => {
                    const sent = cnt(c.events, "SENT");
                    const opened = cnt(c.events, "OPENED");
                    const clicked = cnt(c.events, "CLICKED");
                    return (
                      <tr key={c.id} className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                        <td className="px-5 py-3">
                          <Link href={`/dashboard/campaigns/${c.id}`} className="font-medium hover:text-violet-400 transition-colors">
                            {c.name}
                          </Link>
                          <div className="text-xs text-gray-600 mt-0.5">{c.subject}</div>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[c.status]}`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right text-gray-400">{c._count.recipients}</td>
                        <td className="px-5 py-3 text-right text-gray-400">{sent}</td>
                        <td className="px-5 py-3 text-right text-gray-400">
                          {opened}{sent > 0 && <span className="text-gray-600 text-xs ml-1">({((opened / sent) * 100).toFixed(0)}%)</span>}
                        </td>
                        <td className="px-5 py-3 text-right text-gray-400">
                          {clicked}{sent > 0 && <span className="text-gray-600 text-xs ml-1">({((clicked / sent) * 100).toFixed(0)}%)</span>}
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
