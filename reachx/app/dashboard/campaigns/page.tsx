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
    DRAFT: "text-gray-600 bg-gray-100",
    SENDING: "text-amber-700 bg-amber-100",
    SENT: "text-green-700 bg-green-100",
    FAILED: "text-red-700 bg-red-100",
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar email={session.user?.email ?? ""} />
      <main className="flex-1 overflow-auto p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
              <p className="text-gray-500 text-sm mt-1">{campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""} total</p>
            </div>
            <Link href="/dashboard/campaigns/new">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/25 transition-all">
                + New Campaign
              </button>
            </Link>
          </div>

          {campaigns.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
              <div className="text-4xl mb-3">✉️</div>
              <p className="text-gray-500">No campaigns yet.</p>
              <Link href="/dashboard/campaigns/new">
                <button className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2 rounded-xl text-sm font-medium shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-purple-700 transition-all">
                  Create your first campaign →
                </button>
              </Link>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider bg-gray-50">
                    <th className="text-left px-5 py-3 font-semibold">Campaign</th>
                    <th className="text-left px-5 py-3 font-semibold">Status</th>
                    <th className="text-right px-5 py-3 font-semibold">Recipients</th>
                    <th className="text-right px-5 py-3 font-semibold">Sent</th>
                    <th className="text-right px-5 py-3 font-semibold">Opened</th>
                    <th className="text-right px-5 py-3 font-semibold">Clicked</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c: Campaign) => {
                    const sent = cnt(c.events, "SENT");
                    const opened = cnt(c.events, "OPENED");
                    const clicked = cnt(c.events, "CLICKED");
                    return (
                      <tr key={c.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3">
                          <Link href={`/dashboard/campaigns/${c.id}`} className="font-medium text-gray-900 hover:text-blue-600 transition-colors">
                            {c.name}
                          </Link>
                          <div className="text-xs text-gray-400 mt-0.5">{c.subject}</div>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLE[c.status]}`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right text-gray-600">{c._count.recipients}</td>
                        <td className="px-5 py-3 text-right text-gray-600">{sent}</td>
                        <td className="px-5 py-3 text-right text-gray-600">
                          {opened}{sent > 0 && <span className="text-gray-400 text-xs ml-1">({((opened / sent) * 100).toFixed(0)}%)</span>}
                        </td>
                        <td className="px-5 py-3 text-right text-gray-600">
                          {clicked}{sent > 0 && <span className="text-gray-400 text-xs ml-1">({((clicked / sent) * 100).toFixed(0)}%)</span>}
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
