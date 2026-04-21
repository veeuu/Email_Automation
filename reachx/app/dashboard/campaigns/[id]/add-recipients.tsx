"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddRecipients({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const parsed = input.split(/[\n,]+/).map((e) => e.trim()).filter(Boolean);

  async function handleAdd() {
    setLoading(true);
    const res = await fetch(`/api/campaigns/${campaignId}/recipients`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emails: parsed }),
    });
    const data = await res.json();
    setResult(`Added ${data.added} new recipient${data.added !== 1 ? "s" : ""}`);
    router.refresh();
    setInput("");
    setLoading(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-800 border border-slate-200 hover:bg-slate-50 transition-all"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Add Recipients
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Add Recipients</h2>
              <button onClick={() => { setOpen(false); setResult(""); }} className="text-slate-400 hover:text-slate-700 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <p className="text-sm text-slate-500">One per line or comma-separated. Duplicates are skipped.</p>
            <textarea
              placeholder={"john@example.com\njane@company.com"}
              rows={6}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 resize-none transition-all"
            />
            {parsed.length > 0 && (
              <p className="text-xs font-medium text-indigo-600">{parsed.length} email{parsed.length !== 1 ? "s" : ""} detected</p>
            )}
            {result && (
              <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {result}
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={handleAdd} disabled={loading || !parsed.length} className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold transition-all">
                {loading ? "Adding..." : "Add Recipients"}
              </button>
              <button onClick={() => { setOpen(false); setResult(""); }} className="px-4 py-2.5 rounded-xl text-sm text-slate-500 hover:text-slate-800 border border-slate-200 hover:bg-slate-50 transition-all">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
