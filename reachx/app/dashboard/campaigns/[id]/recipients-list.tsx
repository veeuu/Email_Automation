"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Recipient = { id: string; email: string; hasSent: boolean; hasOpened: boolean; hasBounced: boolean };

export function RecipientsList({ campaignId, recipients }: { campaignId: string; recipients: Recipient[] }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(recipientId: string) {
    setDeleting(recipientId);
    await fetch(`/api/campaigns/${campaignId}/recipients`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipientId }),
    });
    router.refresh();
    setDeleting(null);
  }

  if (recipients.length === 0) {
    return <div className="px-6 py-10 text-center text-slate-400 text-sm">No recipients yet. Add some to get started.</div>;
  }

  return (
    <div className="divide-y divide-slate-100 max-h-72 overflow-auto">
      {recipients.map((r) => (
        <div key={r.id} className="flex items-center justify-between px-6 py-3 hover:bg-slate-50 transition-colors group">
          <span className="font-mono text-sm text-slate-600">{r.email}</span>
          <div className="flex items-center gap-2">
            {r.hasSent    && <span className="text-[11px] font-semibold text-sky-600 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full">Sent</span>}
            {r.hasOpened  && <span className="text-[11px] font-semibold text-violet-600 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full">Opened</span>}
            {r.hasBounced && <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">Bounced</span>}
            <button
              onClick={() => handleDelete(r.id)}
              disabled={deleting === r.id}
              className="opacity-0 group-hover:opacity-100 text-xs text-slate-300 hover:text-rose-500 transition-all ml-1 disabled:opacity-50"
            >
              {deleting === r.id ? (
                <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
