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

  const STATUS_STYLE: Record<string, string> = {
    DRAFT: "text-gray-600 bg-gray-100",
    SENDING: "text-amber-700 bg-amber-100",
    SENT: "text-green-700 bg-green-100",
    FAILED: "text-red-700 bg-red-100",
  };

  const recipientsWithEvents = campaign.recipients.map((r: typeof campaign.recipients[0]) => ({
    id: r.id,
    email: r.email,
    hasSent: campaign.events.some((e: Ev) => e.recipientId === r.id && e.eventType === "SENT"),
    hasOpened: campaign.events.some((e: Ev) => e.recipientId === r.id && e.eventType === "OPENED"),
    hasBounced: campaign.events.some((e: Ev) => e.recipientId === r.id && e.eventType === "BOUNCED"),
  }));

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar email={session.user?.email ?? ""} />
      <main className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-start justify-between">
            <div>
              <Link href="/dashboard/campaigns" className="text-gray-400 hover:text-gray-600 text-sm transition-colors">
                ← Campaigns
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">{campaign.name}</h1>
              <p className="text-gray-500 text-sm mt-1">{campaign.subject}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_STYLE[campaign.status]}`}>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Recipients", value: campaign.recipients.length, color: "from-blue-500 to-blue-600" },
              { label: "Sent", value: sent, color: "from-purple-500 to-purple-600" },
              { label: "Opened", value: opened, color: "from-green-500 to-green-600" },
              { label: "Clicked", value: clicked, color: "from-orange-500 to-orange-600" },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">{s.label}</div>
                <div className={`text-2xl font-bold mt-2 bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>{s.value}</div>
                {s.label === "Opened" && sent > 0 && (
                  <div className="text-xs text-gray-400 mt-0.5">{((opened / sent) * 100).toFixed(1)}% open rate</div>
                )}
              </div>
            ))}
          </div>

          {/* Content preview */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-3">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email content</h2>
            <div
              className="text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-xl p-4 max-h-48 overflow-auto font-mono"
              dangerouslySetInnerHTML={{ __html: campaign.content }}
            />
          </div>

          {/* Recipients */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Recipients ({campaign.recipients.length}) — hover to remove
              </h2>
            </div>
            <RecipientsList campaignId={campaign.id} recipients={recipientsWithEvents} />
          </div>
        </div>
      </main>
    </div>
  );
}
