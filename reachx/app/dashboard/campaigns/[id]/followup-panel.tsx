"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const TRIGGER_OPTIONS = [
  { value: "all",         label: "All recipients",     desc: "Enroll everyone who was sent the campaign" },
  { value: "opened",      label: "Opened the email",   desc: "Only contacts who opened the campaign" },
  { value: "not_opened",  label: "Did not open",       desc: "Contacts who never opened — re-engage them" },
  { value: "clicked",     label: "Clicked a link",     desc: "Contacts who clicked any link" },
  { value: "not_clicked", label: "Did not click",      desc: "Contacts who opened but didn't click" },
];

export function FollowUpPanel({
  campaignId,
  campaignName,
  campaignStatus,
  initialWorkflowId,
  initialWorkflowName,
  initialTrigger,
}: {
  campaignId: string;
  campaignName: string;
  campaignStatus: string;
  initialWorkflowId: string | null;
  initialWorkflowName: string | null;
  initialTrigger: string | null;
}) {
  const router = useRouter();
  const [workflowId, setWorkflowId] = useState(initialWorkflowId ?? "");
  const [workflowName, setWorkflowName] = useState(initialWorkflowName ?? "");
  const [trigger, setTrigger] = useState(initialTrigger ?? "all");
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const hasWorkflow = !!workflowId;

  async function createFollowUp() {
    setCreating(true);
    setError("");
    try {
      // 1. Create a new workflow named after the campaign
      const wfRes = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Follow-up: ${campaignName}`,
          triggerType: "MANUAL",
          triggerConfig: { campaignId, trigger },
        }),
      });
      if (!wfRes.ok) throw new Error("Failed to create workflow");
      const wf = await wfRes.json();

      // 2. Link it to the campaign
      await fetch(`/api/campaigns/${campaignId}/followup`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          followUpWorkflowId: wf.id,
          followUpTrigger: trigger,
        }),
      });

      setWorkflowId(wf.id);
      setWorkflowName(wf.name);

      // 3. Open the workflow builder
      router.push(`/dashboard/workflows/${wf.id}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setCreating(false);
    }
  }

  async function saveTrigger() {
    setSaving(true);
    await fetch(`/api/campaigns/${campaignId}/followup`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ followUpWorkflowId: workflowId, followUpTrigger: trigger }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function removeFollowUp() {
    if (!confirm("Remove the follow-up workflow link? The workflow itself won't be deleted.")) return;
    await fetch(`/api/campaigns/${campaignId}/followup`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ followUpWorkflowId: null, followUpTrigger: null }),
    });
    setWorkflowId("");
    setWorkflowName("");
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Follow-up Workflow</p>
          <p className="text-xs text-slate-400 mt-0.5">Auto-enroll recipients into a workflow after this campaign sends</p>
        </div>
        {hasWorkflow && (
          <span className="text-[11px] px-2.5 py-1 rounded-full font-semibold border text-violet-600 bg-violet-50 border-violet-200">
            Linked
          </span>
        )}
      </div>

      <div className="p-6 space-y-5">
        {!hasWorkflow ? (
          /* ── No workflow yet ── */
          <div className="flex flex-col items-center py-6 gap-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-violet-500">
                <path d="M5 12h14"/><circle cx="5" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
                <circle cx="12" cy="5" r="2"/><path d="M12 7v5"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">No follow-up workflow yet</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Create a dedicated follow-up workflow for this campaign. It will be saved to your workflows and linked here automatically.
              </p>
            </div>

            {/* Trigger picker before creating */}
            <div className="w-full space-y-2 text-left">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Enroll recipients who</label>
              <div className="space-y-1.5">
                {TRIGGER_OPTIONS.map((opt) => (
                  <button key={opt.value} onClick={() => setTrigger(opt.value)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border text-left transition-all ${
                      trigger === opt.value ? "border-indigo-300 bg-indigo-50" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${trigger === opt.value ? "border-indigo-600" : "border-slate-300"}`}>
                      {trigger === opt.value && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-800">{opt.label}</div>
                      <div className="text-xs text-slate-400">{opt.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-rose-500">{error}</p>}

            <button onClick={createFollowUp} disabled={creating}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              {creating ? "Creating..." : "Create Follow-up Workflow"}
            </button>
          </div>
        ) : (
          /* ── Workflow linked ── */
          <>
            {/* Workflow card */}
            <div className="flex items-center gap-4 p-4 bg-violet-50 border border-violet-200 rounded-xl">
              <div className="w-9 h-9 rounded-xl bg-violet-100 border border-violet-200 flex items-center justify-center shrink-0">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-violet-600">
                  <path d="M5 12h14"/><circle cx="5" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
                  <circle cx="12" cy="5" r="2"/><path d="M12 7v5"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-800 truncate">{workflowName}</div>
                <div className="text-xs text-slate-400 mt-0.5">Linked follow-up workflow</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a href={`/dashboard/workflows/${workflowId}`}
                  className="text-xs font-semibold text-violet-600 hover:text-violet-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-violet-100">
                  Edit →
                </a>
                <button onClick={removeFollowUp} className="text-xs text-slate-400 hover:text-rose-500 transition-colors px-2 py-1.5 rounded-lg hover:bg-rose-50">
                  Remove
                </button>
              </div>
            </div>

            {/* Trigger condition */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Enroll recipients who</label>
              <div className="space-y-1.5">
                {TRIGGER_OPTIONS.map((opt) => (
                  <button key={opt.value} onClick={() => setTrigger(opt.value)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border text-left transition-all ${
                      trigger === opt.value ? "border-indigo-300 bg-indigo-50" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${trigger === opt.value ? "border-indigo-600" : "border-slate-300"}`}>
                      {trigger === opt.value && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-800">{opt.label}</div>
                      <div className="text-xs text-slate-400">{opt.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {campaignStatus === "SENT" && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700">
                Campaign already sent. Follow-up applies to future sends. To enroll existing recipients now, use the <a href="/dashboard/contacts" className="underline">Contacts page</a>.
              </div>
            )}

            <button onClick={saveTrigger} disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all">
              {saving ? "Saving..." : saved ? "Saved ✓" : "Save trigger"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
