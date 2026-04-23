"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DuplicateCampaignButton({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDuplicate() {
    setLoading(true);
    const res = await fetch(`/api/campaigns/${campaignId}/duplicate`, { method: "POST" });
    const data = await res.json();
    if (res.ok) router.push(`/dashboard/campaigns/${data.id}`);
    else setLoading(false);
  }

  return (
    <button
      onClick={handleDuplicate}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-800 border border-slate-200 hover:bg-slate-50 disabled:opacity-50 transition-all"
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
      </svg>
      {loading ? "Duplicating..." : "Duplicate"}
    </button>
  );
}
