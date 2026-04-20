"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";

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
        className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
      >
        + Add Recipients
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900">Add Recipients</h2>
            <p className="text-sm text-gray-500">Paste emails (one per line or comma-separated). Duplicates are skipped.</p>
            <Textarea
              placeholder="john@example.com&#10;jane@company.com"
              rows={6}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="rounded-xl font-mono text-sm"
            />
            {parsed.length > 0 && (
              <p className="text-xs text-blue-600 font-medium">{parsed.length} email{parsed.length !== 1 ? "s" : ""} detected</p>
            )}
            {result && <p className="text-xs text-green-600 font-medium">{result}</p>}
            <div className="flex gap-3">
              <button onClick={handleAdd} disabled={loading || !parsed.length} className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-xl font-medium disabled:opacity-50">
                {loading ? "Adding..." : "Add Recipients"}
              </button>
              <button onClick={() => { setOpen(false); setResult(""); }} className="px-4 py-2 rounded-xl text-gray-600 border border-gray-200">Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
