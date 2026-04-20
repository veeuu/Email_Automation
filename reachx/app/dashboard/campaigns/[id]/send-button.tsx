"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CampaignSendButton({
  campaignId,
  recipientCount,
}: {
  campaignId: string;
  recipientCount: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSend() {
    if (!confirm(`Send to ${recipientCount} recipient${recipientCount !== 1 ? "s" : ""}?`)) return;
    setLoading(true);
    setError("");

    const res = await fetch(`/api/campaigns/${campaignId}/send`, { method: "POST" });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Failed to send");
      setLoading(false);
    } else {
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleSend}
        disabled={loading}
        className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 transition-colors px-4 py-2 rounded-lg text-sm font-semibold"
      >
        {loading ? "Sending..." : `Send to ${recipientCount} →`}
      </button>
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  );
}
