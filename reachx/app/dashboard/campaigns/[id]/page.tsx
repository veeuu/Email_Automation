import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import { CampaignSendButton } from "./send-button";
import { EditPanel } from "./edit-panel";
import { AddRecipients } from "./add-recipients";
import { RecipientsList } from "./recipients-list";

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

  const STATUS_STYLE: Record<string, string> = {
    DRAFT:   "text-slate-400 bg-slate-500/10 border-slate-500/20",
    SENDING: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    SENT:    "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    FAILED:  "text-rose-400 bg-rose-500/10 border-rose-500/20",
  };

  const recipientsWithEvents = campaign.recipients.map((r: typeof campaign.recipients[0]) => ({
    id: r.id,
    email: r.email,
    hasSent: campaign.events.some((e: Ev) => e.recipientId === r.id && e.eventType === "SENT"),
    hasOpened: campaign.events.some((e: Ev) => e.recipientId === r.id && e.eventType === "OPENED"),
    hasBounced: campaign.events.some((e: Ev) => e.recipientId === r.id && e.eventType === "BOUNCED"),
  }));

  const STATS = [
    { label: "Recipients", value: campaign.recipients.length, color: "text-indigo-400", sub: null },
    { label: "Sent",       value: sent,    color: "text-sky-400",     sub: null },
    { label: "Opened",     value: opened,  color: "text-violet-400",  sub: sent > 0 ? `${((opened / sent) * 100).toFixed(1)}% rate` : null },
    { label: "Clicked",    value: clicked, color: "text-emerald-400", sub: sent > 0 ? `${((clicked / sent) * 100).toFixed(1)}% rate` : null },
    { label: "Bounced",    value: bounced, color: "text-rose-400",    sub: null },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      <Sidebar email={session.user?.email ?? ""} />
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-8 py-10 space-y-8">

          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <Link href="/dashboard/campaigns" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
                ← Campaigns
              </Link>
              <h1 className="text-2xl font-bold text-white mt-2 tracking-tight">{campaign.name}</h1>
              <p className="text-slate-500 text-sm mt-1">{campaign.subject}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <span className={`text-xs px-3 py-1.5 rounded-full font-medium border ${STATUS_STYLE[campaign.status]}`}>
                {campaign.status}
              </span>
              <AddRecipients campaignId={campaign.id} />
              <EditPanel campaignId={campaign.id} name={campaign.name} subject={campaign.subject} content={campaign.content} />
              {campaign.status === "DRAFT" && (
                <CampaignSendButton campaignId={campaign.id} recipientCount={campaign.recipients.length} />
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {STATS.map((s) => (
              <div key={s.label} className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 hover:bg-white/[0.05] transition-colors">
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs font-medium text-slate-400 mt-1">{s.label}</div>
                {s.sub && <div className="text-xs text-slate-600 mt-0.5">{s.sub}</div>}
              </div>
            ))}
          </div>

          {/* Content preview */}
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 space-y-3">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Email content</h2>
            <div
              className="text-sm text-slate-400 bg-white/[0.02] border border-white/5 rounded-xl p-4 max-h-48 overflow-auto font-mono"
              dangerouslySetInnerHTML={{ __html: campaign.content }}
            />
          </div>

          {/* Recipients */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                Recipients ({campaign.recipients.length})
              </h2>
            </div>
            <RecipientsList campaignId={campaign.id} recipients={recipientsWithEvents} />
          </div>

        </div>
      </main>
    </div>
  );
}
