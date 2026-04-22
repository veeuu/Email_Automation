"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteCampaignButton({ campaignId, campaignStatus }: { campaignId: string; campaignStatus: string }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (campaignStatus === "SENDING") return null;

  async function handleDelete() {
    setDeleting(true);
    await fetch(`/api/campaigns/${campaignId}/delete`, { method: "DELETE" });
    router.push("/dashboard/campaigns");
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500">Delete campaign?</span>
        <button onClick={handleDelete} disabled={deleting}
          className="text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50">
          {deleting ? "Deleting..." : "Yes, delete"}
        </button>
        <button onClick={() => setConfirm(false)} className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-all">
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button onClick={() => setConfirm(true)}
      className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-500 border border-slate-200 hover:border-rose-200 hover:bg-rose-50 px-3 py-2 rounded-xl transition-all">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
      </svg>
      Delete
    </button>
  );
}
