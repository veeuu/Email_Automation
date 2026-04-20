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

  const totalSent = campaigns.reduce((acc: number, c: Campaign) => acc + cnt(c.events, "SENT"), 0);
  const totalOpened = campaigns.reduce((acc: number, c: Campaign) => acc + cnt(c.events, "OPENED"), 0);
  const totalClicked = campaigns.reduce((acc: number, c: Campaign) => acc + cnt(c.events, "CLICKED"), 0);
  const totalBounced = campaigns.reduce((acc: number, c: Campaign) => acc + cnt(c.events, "BOUNCED"), 0);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar email={session.user?.email ?? ""} />
      <main className="flex-1 overflow-auto p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-500 text-sm mt-1">Aggregate performance across all campaigns.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Sent", value: totalSent, color: "from-blue-500 to-blue-600", rate: null },
              { label: "Total Opened", value: totalOpened, color: "from-purple-500 to-purple-600", rate: totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) + "%" : null },
              { label: "Total Clicked", value: totalClicked, color: "from-green-500 to-green-600", rate: totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(1) + "%" : null },
              { label: "Bounced", value: totalBounced, color: "from-red-500 to-red-600", rate: totalSent > 0 ? ((totalBounced / totalSent) * 100).toFixed(1) + "%" : null },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">{s.label}</div>
                <div className={`text-2xl font-bold mt-2 bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>{s.value}</div>
                {s.rate && <div className="text-xs text-gray-400 mt-0.5">{s.rate} rate</div>}
              </div>
            ))}
          </div>

          <div>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Per campaign</h2>
            {campaigns.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center text-gray-500 text-sm shadow-sm">
                No campaign data yet.
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider bg-gray-50">
                      <th className="text-left px-5 py-3 font-semibold">Campaign</th>
                      <th className="text-right px-5 py-3 font-semibold">Sent</th>
                      <th className="text-right px-5 py-3 font-semibold">Open rate</th>
                      <th className="text-right px-5 py-3 font-semibold">Click rate</th>
                      <th className="text-right px-5 py-3 font-semibold">Bounces</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((c: Campaign) => {
                      const sent = cnt(c.events, "SENT");
                      const opened = cnt(c.events, "OPENED");
                      const clicked = cnt(c.events, "CLICKED");
                      const bounced = cnt(c.events, "BOUNCED");
                      return (
                        <tr key={c.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-3 font-medium text-gray-900">{c.name}</td>
                          <td className="px-5 py-3 text-right text-gray-600">{sent}</td>
                          <td className="px-5 py-3 text-right text-purple-600 font-medium">
                            {sent > 0 ? ((opened / sent) * 100).toFixed(1) + "%" : "—"}
                          </td>
                          <td className="px-5 py-3 text-right text-green-600 font-medium">
                            {sent > 0 ? ((clicked / sent) * 100).toFixed(1) + "%" : "—"}
                          </td>
                          <td className="px-5 py-3 text-right text-red-500">{bounced}</td>
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
