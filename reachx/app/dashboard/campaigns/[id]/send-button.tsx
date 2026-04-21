"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CampaignSendButton({ campaignId, recipientCount }: { campaignId: string; recipientCount: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState("");

  async function handleSend() {
    setLoading(true);
    setError("");
    setConfirm(false);
    const res = await fetch(`/api/campaigns/${campaignId}/send`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Failed to send"); setLoading(false); }
    else router.refresh();
  }

  return (
    <>
      <div className="flex flex-col items-end gap-1">
        <button
          onClick={() => setConfirm(true)}
          disabled={loading || recipientCount === 0}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all hover:-translate-y-px"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Sending...
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
              Send to {recipientCount}
            </>
          )}
        </button>
        {error && <p className="text-xs text-rose-500">{error}</p>}
      </div>

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">Send campaign?</h3>
              <p className="text-sm text-slate-500 mt-1">
                This will send to <span className="text-slate-800 font-medium">{recipientCount} recipient{recipientCount !== 1 ? "s" : ""}</span>. This cannot be undone.
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={handleSend} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-all">
                Send now
              </button>
              <button onClick={() => setConfirm(false)} className="px-4 py-2.5 rounded-xl text-sm text-slate-500 hover:text-slate-800 border border-slate-200 hover:bg-slate-50 transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
