"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SchedulePanel({
  campaignId,
  campaignStatus,
  initialScheduledAt,
}: {
  campaignId: string;
  campaignStatus: string;
  initialScheduledAt: string | null;
}) {
  const router = useRouter();
  const [scheduledAt, setScheduledAt] = useState(
    initialScheduledAt ? new Date(initialScheduledAt).toISOString().slice(0, 16) : ""
  );
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");

  const isScheduled = !!initialScheduledAt && (campaignStatus === "DRAFT" || campaignStatus === "SCHEDULED");

  async function schedule() {
    if (!scheduledAt) { setError("Pick a date and time"); return; }
    setSaving(true); setError("");
    const res = await fetch(`/api/campaigns/${campaignId}/schedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scheduledAt }),
    });
    setSaving(false);
    if (!res.ok) { const d = await res.json(); setError(d.error ?? "Failed"); return; }
    router.refresh();
  }

  async function cancelSchedule() {
    setCancelling(true);
    await fetch(`/api/campaigns/${campaignId}/schedule`, { method: "DELETE" });
    setCancelling(false);
    router.refresh();
  }

  if (campaignStatus !== "DRAFT" && campaignStatus !== "SCHEDULED") return null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Scheduled Send</p>
          <p className="text-xs text-slate-400 mt-0.5">Send this campaign at a specific date and time</p>
        </div>
        {isScheduled && (
          <span className="text-[11px] px-2.5 py-1 rounded-full font-semibold border text-amber-600 bg-amber-50 border-amber-200">
            Scheduled
          </span>
        )}
      </div>

      <div className="p-6 space-y-4">
        {isScheduled ? (
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <p className="text-xs font-semibold text-amber-700">Scheduled for</p>
              <p className="text-sm font-bold text-amber-800 mt-0.5">
                {new Date(initialScheduledAt!).toLocaleDateString("en-GB", {
                  day: "2-digit", month: "short", year: "numeric",
                  hour: "2-digit", minute: "2-digit", hour12: false,
                })}
              </p>
            </div>
            <button onClick={cancelSchedule} disabled={cancelling}
              className="text-sm text-rose-500 hover:text-rose-700 font-medium border border-rose-200 hover:bg-rose-50 px-4 py-2.5 rounded-xl transition-all disabled:opacity-50">
              {cancelling ? "Cancelling..." : "Cancel"}
            </button>
          </div>
        ) : (
          <div className="flex items-end gap-3">
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Send at</label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>
            <button onClick={schedule} disabled={saving}
              className="bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0">
              {saving ? "Scheduling..." : "Schedule"}
            </button>
          </div>
        )}
        {error && <p className="text-sm text-rose-500">{error}</p>}
      </div>
    </div>
  );
}
