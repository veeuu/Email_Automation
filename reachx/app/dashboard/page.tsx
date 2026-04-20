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
  const name = session.user?.name ?? session.user?.email ?? "there";

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
        <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Good to see you, {name.split(" ")[0]} 👋</h1>
            <p className="text-gray-500 text-sm mt-1">Here&apos;s what&apos;s happening with your campaigns.</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Campaigns", value: String(campaigns.length), sub: "total", color: "from-blue-500 to-blue-600" },
              { label: "Emails Sent", value: String(totalSent), sub: "all time", color: "from-purple-500 to-purple-600" },
              { label: "Open Rate", value: openRate, sub: "avg", color: "from-green-500 to-green-600" },
              { label: "Click Rate", value: clickRate, sub: "avg", color: "from-orange-500 to-orange-600" },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">{s.label}</div>
                <div className={`text-2xl font-bold mt-2 bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>{s.value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div>
            <h2 className="text-xs font-semibold text-gray-500 mb-4 uppercase tracking-wider">Quick actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: "New Campaign", desc: "Create and send an email campaign", href: "/dashboard/campaigns/new", cta: "Create →", color: "group-hover:text-blue-600" },
                { title: "Validate Emails", desc: "Check a list of emails before sending", href: "/validate", cta: "Validate →", color: "group-hover:text-purple-600" },
                { title: "View Analytics", desc: "See opens, clicks, and engagement", href: "/dashboard/analytics", cta: "View →", color: "group-hover:text-green-600" },
              ].map((a) => (
                <Link key={a.title} href={a.href} className="group bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-md transition-all space-y-2">
                  <div className="font-semibold text-sm text-gray-900">{a.title}</div>
                  <div className="text-xs text-gray-500">{a.desc}</div>
                  <div className={`text-xs font-medium text-gray-400 transition-colors ${a.color}`}>{a.cta}</div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent campaigns */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent campaigns</h2>
              <Link href="/dashboard/campaigns" className="text-xs text-blue-600 hover:text-blue-700 font-medium">View all →</Link>
            </div>

            {campaigns.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
                <div className="text-4xl mb-3">✉️</div>
                <p className="text-gray-500 text-sm">No campaigns yet.</p>
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
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((c: Campaign) => (
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
                        <td className="px-5 py-3 text-right text-gray-600">{cnt(c.events, "SENT")}</td>
                        <td className="px-5 py-3 text-right text-gray-600">{cnt(c.events, "OPENED")}</td>
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
