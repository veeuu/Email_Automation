"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Recipient = {
  id: string;
  email: string;
  hasSent: boolean;
  hasOpened: boolean;
  hasBounced: boolean;
};

export function RecipientsList({
  campaignId,
  recipients,
}: {
  campaignId: string;
  recipients: Recipient[];
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(recipientId: string) {
    if (!confirm("Remove this recipient?")) return;
    setDeleting(recipientId);
    await fetch(`/api/campaigns/${campaignId}/recipients`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipientId }),
    });
    router.refresh();
    setDeleting(null);
  }

  return (
    <div className="divide-y divide-gray-100 max-h-64 overflow-auto">
      {recipients.map((r) => (
        <div key={r.id} className="flex items-center justify-between px-6 py-3 text-sm hover:bg-gray-50 transition-colors group">
          <span className="font-mono text-gray-700">{r.email}</span>
          <div className="flex items-center gap-2">
            {r.hasSent && <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full font-medium">Sent</span>}
            {r.hasOpened && <span className="text-xs text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full font-medium">Opened</span>}
            {r.hasBounced && <span className="text-xs text-red-700 bg-red-100 px-2 py-0.5 rounded-full font-medium">Bounced</span>}
            <button
              onClick={() => handleDelete(r.id)}
              disabled={deleting === r.id}
              className="opacity-0 group-hover:opacity-100 text-xs text-red-500 hover:text-red-700 transition-all ml-1 disabled:opacity-50"
            >
              {deleting === r.id ? "..." : "✕"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
