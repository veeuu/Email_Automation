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

  const totalSent = campaigns.reduce(
    (acc, c) => acc + c.events.filter((e) => e.eventType === "SENT").length, 0
  );
  const totalOpened = campaigns.reduce(
    (acc, c) => acc + c.events.filter((e) => e.eventType === "OPENED").length, 0
  );
  const totalClicked = campaigns.reduce(
    (acc, c) => acc + c.events.filter((e) => e.eventType === "CLICKED").length, 0
  );
  const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) + "%" : "—";
  const clickRate = totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(1) + "%" : "—";

  const name = session.user?.name ?? session.user?.email ?? "there";

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
        <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <h1 className="text-2xl font-bold">Good to see you, {name.split(" ")[0]} 👋</h1>
            <p className="text-gray-500 text-sm mt-1">Here&apos;s what&apos;s happening with your campaigns.</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Campaigns", value: String(campaigns.length), sub: "total" },
              { label: "Emails Sent", value: String(totalSent), sub: "all time" },
              { label: "Open Rate", value: openRate, sub: "avg" },
              { label: "Click Rate", value: clickRate, sub: "avg" },
            ].map((s) => (
              <div key={s.label} className="bg-[#0e1120] border border-white/8 rounded-xl p-5">
                <div className="text-xs text-gray-500 uppercase tracking-wider">{s.label}</div>
                <div className="text-2xl font-bold mt-2">{s.value}</div>
                <div className="text-xs text-gray-600 mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div>
            <h2 className="text-xs font-medium text-gray-500 mb-4 uppercase tracking-wider">Quick actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: "New Campaign", desc: "Create and send an email campaign", href: "/dashboard/campaigns/new", cta: "Create →" },
                { title: "Validate Emails", desc: "Check a list of emails before sending", href: "/validate", cta: "Validate →" },
                { title: "View Analytics", desc: "See opens, clicks, and engagement", href: "/dashboard/analytics", cta: "View →" },
              ].map((a) => (
                <Link key={a.title} href={a.href} className="bg-[#0e1120] border border-white/8 rounded-xl p-5 hover:border-violet-500/30 transition-colors group space-y-2">
                  <div className="font-semibold text-sm">{a.title}</div>
                  <div className="text-xs text-gray-500">{a.desc}</div>
                  <div className="text-xs text-violet-400 group-hover:text-violet-300">{a.cta}</div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent campaigns */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Recent campaigns</h2>
              <Link href="/dashboard/campaigns" className="text-xs text-violet-400 hover:text-violet-300">View all →</Link>
            </div>

            {campaigns.length === 0 ? (
              <div className="bg-[#0e1120] border border-white/8 rounded-xl p-8 text-center">
                <p className="text-gray-600 text-sm">No campaigns yet.</p>
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
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((c) => (
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
                        <td className="px-5 py-3 text-right text-gray-400">
                          {c.events.filter((e) => e.eventType === "SENT").length}
                        </td>
                        <td className="px-5 py-3 text-right text-gray-400">
                          {c.events.filter((e) => e.eventType === "OPENED").length}
                        </td>
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
