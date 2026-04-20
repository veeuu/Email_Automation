import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import { CampaignSendButton } from "./send-button";

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;

  const campaign = await prisma.campaign.findFirst({
    where: { id, userId: session.user.id },
    include: {
      recipients: true,
      events: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!campaign) notFound();

  type Ev = (typeof campaign)["events"][0];
  const cnt = (type: string) => campaign.events.filter((e: Ev) => e.eventType === type).length;

  const sent = cnt("SENT");
  const opened = cnt("OPENED");
  const clicked = cnt("CLICKED");
  const bounced = cnt("BOUNCED");

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
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-start justify-between">
            <div>
              <Link href="/dashboard/campaigns" className="text-gray-500 hover:text-white text-sm transition-colors">
                ← Campaigns
              </Link>
              <h1 className="text-2xl font-bold mt-2">{campaign.name}</h1>
              <p className="text-gray-500 text-sm mt-1">{campaign.subject}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLOR[campaign.status]}`}>
                {campaign.status}
              </span>
              {campaign.status === "DRAFT" && (
                <CampaignSendButton campaignId={campaign.id} recipientCount={campaign.recipients.length} />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Recipients", value: campaign.recipients.length },
              { label: "Sent", value: sent },
              { label: "Opened", value: opened },
              { label: "Clicked", value: clicked },
            ].map((s) => (
              <div key={s.label} className="bg-[#0e1120] border border-white/8 rounded-xl p-5">
                <div className="text-xs text-gray-500 uppercase tracking-wider">{s.label}</div>
                <div className="text-2xl font-bold mt-2">{s.value}</div>
                {s.label === "Opened" && sent > 0 && (
                  <div className="text-xs text-gray-600 mt-0.5">{((opened / sent) * 100).toFixed(1)}%</div>
                )}
              </div>
            ))}
          </div>

          <div className="bg-[#0e1120] border border-white/8 rounded-2xl p-6 space-y-3">
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Email content</h2>
            <div
              className="text-sm text-gray-300 bg-[#161929] rounded-xl p-4 max-h-48 overflow-auto font-mono"
              dangerouslySetInnerHTML={{ __html: campaign.content }}
            />
          </div>

          <div className="bg-[#0e1120] border border-white/8 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5">
              <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                Recipients ({campaign.recipients.length})
              </h2>
            </div>
            <div className="divide-y divide-white/5 max-h-64 overflow-auto">
              {campaign.recipients.map((r: typeof campaign.recipients[0]) => {
                const recipientEvents = campaign.events.filter((e: Ev) => e.recipientId === r.id);
                const hasSent = recipientEvents.some((e: Ev) => e.eventType === "SENT");
                const hasOpened = recipientEvents.some((e: Ev) => e.eventType === "OPENED");
                const hasBounced = recipientEvents.some((e: Ev) => e.eventType === "BOUNCED");
                return (
                  <div key={r.id} className="flex items-center justify-between px-6 py-3 text-sm">
                    <span className="font-mono text-gray-300">{r.email}</span>
                    <div className="flex gap-2">
                      {hasSent && <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Sent</span>}
                      {hasOpened && <span className="text-xs text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full">Opened</span>}
                      {hasBounced && <span className="text-xs text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">Bounced</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
