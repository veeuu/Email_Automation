import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import { CampaignSendButton } from "./send-button";
import { EditPanel } from "./edit-panel";
import { AddRecipients } from "./add-recipients";
import { RecipientsList } from "./recipients-list";
import { FollowUpPanel } from "./followup-panel";

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

  // Fetch linked follow-up workflow name if exists
  const campaignAny = campaign as unknown as Record<string, string>;
  const followUpWorkflow = campaignAny.followUpWorkflowId
    ? await prisma.workflow.findUnique({ where: { id: campaignAny.followUpWorkflowId }, select: { id: true, name: true } })
    : null;

  type Ev = (typeof campaign)["events"][0];
  const cnt = (type: string) => campaign.events.filter((e: Ev) => e.eventType === type).length;

  const sent    = cnt("SENT");
  const opened  = cnt("OPENED");
  const clicked = cnt("CLICKED");
  const bounced = cnt("BOUNCED");

  const STATUS_STYLE: Record<string, string> = {
    DRAFT:   "text-slate-500 bg-slate-100 border-slate-200",
    SENDING: "text-amber-600 bg-amber-50 border-amber-200",
    SENT:    "text-emerald-600 bg-emerald-50 border-emerald-200",
    FAILED:  "text-rose-600 bg-rose-50 border-rose-200",
  };

  const recipientsWithEvents = campaign.recipients.map((r: typeof campaign.recipients[0]) => ({
    id: r.id,
    email: r.email,
    hasSent:    campaign.events.some((e: Ev) => e.recipientId === r.id && e.eventType === "SENT"),
    hasOpened:  campaign.events.some((e: Ev) => e.recipientId === r.id && e.eventType === "OPENED"),
    hasBounced: campaign.events.some((e: Ev) => e.recipientId === r.id && e.eventType === "BOUNCED"),
  }));

  const STATS = [
    { label: "Recipients", value: campaign.recipients.length, color: "text-indigo-600",  sub: null },
    { label: "Sent",       value: sent,    color: "text-sky-600",     sub: null },
    { label: "Opened",     value: opened,  color: "text-violet-600",  sub: sent > 0 ? `${((opened  / sent) * 100).toFixed(1)}% rate` : null },
    { label: "Clicked",    value: clicked, color: "text-emerald-600", sub: sent > 0 ? `${((clicked / sent) * 100).toFixed(1)}% rate` : null },
    { label: "Bounced",    value: bounced, color: "text-rose-500",    sub: null },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar email={session.user?.email ?? ""} />
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-8 py-8 space-y-7">

          <div className="flex items-start justify-between gap-4 pt-1">
            <div>
              <Link href="/dashboard/campaigns" className="text-slate-400 hover:text-slate-700 text-sm transition-colors">
                ← Campaigns
              </Link>
              <h1 className="text-xl font-bold text-slate-900 mt-2 tracking-tight">{campaign.name}</h1>
              <p className="text-slate-400 text-sm mt-1">{campaign.subject}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-end shrink-0">
              <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold border ${STATUS_STYLE[campaign.status]}`}>
                {campaign.status}
              </span>
              <AddRecipients campaignId={campaign.id} />
              <EditPanel campaignId={campaign.id} name={campaign.name} subject={campaign.subject} content={campaign.content} />
              {campaign.status === "DRAFT" && (
                <CampaignSendButton campaignId={campaign.id} recipientCount={campaign.recipients.length} />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {STATS.map((s) => (
              <div key={s.label} className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 hover:shadow-sm transition-all">
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs font-medium text-slate-500 mt-1">{s.label}</div>
                {s.sub && <div className="text-xs text-slate-400 mt-0.5">{s.sub}</div>}
              </div>
            ))}
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Email content</p>
            <div
              className="text-sm text-slate-600 bg-slate-50 border border-slate-100 rounded-xl p-4 max-h-48 overflow-auto font-mono leading-relaxed"
              dangerouslySetInnerHTML={{ __html: campaign.content }}
            />
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Recipients</p>
              <span className="text-xs text-slate-400">{campaign.recipients.length} total</span>
            </div>
            <RecipientsList campaignId={campaign.id} recipients={recipientsWithEvents} />
          </div>

          <FollowUpPanel
            campaignId={campaign.id}
            campaignName={campaign.name}
            campaignStatus={campaign.status}
            initialWorkflowId={followUpWorkflow?.id ?? null}
            initialWorkflowName={followUpWorkflow?.name ?? null}
            initialTrigger={campaignAny.followUpTrigger ?? null}
          />

        </div>
      </main>
    </div>
  );
}
