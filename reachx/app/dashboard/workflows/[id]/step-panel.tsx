"use client";

import { WorkflowStep } from "./workflow-builder";

const TRIGGER_LABELS: Record<string, string> = {
  MANUAL: "Manual enrollment", CONTACT_CREATED: "Contact created",
  TAG_ADDED: "Tag added", CAMPAIGN_OPENED: "Campaign opened", CAMPAIGN_CLICKED: "Campaign clicked",
};

const STEP_TYPE_LABEL: Record<string, string> = {
  TRIGGER: "Trigger", SEND_EMAIL: "Send Email", WAIT: "Wait",
  IF_CONDITION: "If Condition", UPDATE_TAG: "Update Tag",
  REMOVE_TAG: "Remove Tag", GO_TO: "Go To", END: "End",
};

const INPUT = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

export function StepPanel({ step, onChange, onClose, onDelete, onDuplicate, allSteps }: {
  step: WorkflowStep;
  onChange: (patch: Partial<WorkflowStep>) => void;
  onClose: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  allSteps?: WorkflowStep[];
}) {
  const cfg = step.config;

  function set(key: string, value: unknown) {
    onChange({ config: { ...cfg, [key]: value } });
  }

  return (
    <div className="w-72 bg-white border-l border-slate-200 flex flex-col shrink-0 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Configure</p>
          <h3 className="text-sm font-bold text-slate-800 mt-0.5">{STEP_TYPE_LABEL[step.type]}</h3>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onDuplicate} title="Duplicate" className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
          </button>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 px-5 py-4 space-y-4">
        {/* Notes field — always visible */}
        <Field label="Notes (optional)">
          <textarea
            value={step.notes ?? ""}
            onChange={(e) => onChange({ notes: e.target.value })}
            placeholder="Add a note about this step..."
            rows={2}
            className={INPUT + " resize-none text-xs"}
          />
        </Field>

        <div className="border-t border-slate-100" />

        {step.type === "TRIGGER" && (
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Trigger type</label>
              <div className="text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                {TRIGGER_LABELS[cfg.label as string] ?? (cfg.label as string) ?? "—"}
              </div>
              <p className="text-xs text-slate-400">Set when creating the workflow.</p>
            </div>

            {/* TAG_ADDED — optional tag filter */}
            {(cfg.label as string) === "TAG_ADDED" && (
              <Field label="Tag filter (optional)">
                <input
                  value={(cfg.tag as string) ?? ""}
                  onChange={(e) => set("tag", e.target.value)}
                  placeholder="e.g. lead — leave blank for any tag"
                  className={INPUT}
                />
                <p className="text-[11px] text-slate-400 mt-1">Only trigger when this specific tag is added.</p>
              </Field>
            )}

            {/* CAMPAIGN_OPENED / CAMPAIGN_CLICKED — optional campaign ID filter */}
            {((cfg.label as string) === "CAMPAIGN_OPENED" || (cfg.label as string) === "CAMPAIGN_CLICKED") && (
              <Field label="Campaign ID filter (optional)">
                <input
                  value={(cfg.campaignId as string) ?? ""}
                  onChange={(e) => set("campaignId", e.target.value)}
                  placeholder="Leave blank for any campaign"
                  className={INPUT}
                />
                <p className="text-[11px] text-slate-400 mt-1">Only trigger for a specific campaign.</p>
              </Field>
            )}
          </div>
        )}

        {step.type === "SEND_EMAIL" && (
          <>
            <Field label="Subject">
              <input value={(cfg.subject as string) ?? ""} onChange={(e) => set("subject", e.target.value)} placeholder="Email subject line" className={INPUT} />
            </Field>
            <Field label="Body (HTML)">
              <textarea value={(cfg.htmlContent as string) ?? ""} onChange={(e) => set("htmlContent", e.target.value)}
                placeholder="<p>Hi {{name}},</p>" rows={7} className={INPUT + " resize-none font-mono text-xs"} />
            </Field>
            <p className="text-[11px] text-slate-400">Use {"{{name}}"}, {"{{email}}"} as placeholders.</p>
          </>
        )}

        {step.type === "WAIT" && (
          <>
            <Field label="Delay unit">
              <select value={(cfg.unit as string) ?? "minutes"} onChange={(e) => set("unit", e.target.value)} className={INPUT}>
                <option value="minutes">Minutes</option>
                <option value="hours">Hours</option>
                <option value="days">Days</option>
              </select>
            </Field>
            <Field label={`Amount (in ${(cfg.unit as string) ?? "minutes"})`}>
              <input type="number" min={1} value={(cfg.delayMinutes as number) ?? 60}
                onChange={(e) => set("delayMinutes", parseInt(e.target.value) || 1)} className={INPUT} />
            </Field>
          </>
        )}

        {step.type === "IF_CONDITION" && (
          <>
            <Field label="Field">
              <select value={(cfg.field as string) ?? "tag"} onChange={(e) => set("field", e.target.value)} className={INPUT}>
                <option value="tag">Tag</option>
                <option value="email">Email contains</option>
              </select>
            </Field>
            <Field label="Operator">
              <select value={(cfg.operator as string) ?? "includes"} onChange={(e) => set("operator", e.target.value)} className={INPUT}>
                <option value="includes">includes</option>
                <option value="excludes">excludes</option>
              </select>
            </Field>
            <Field label="Value">
              <input value={(cfg.value as string) ?? ""} onChange={(e) => set("value", e.target.value)} placeholder="e.g. lead" className={INPUT} />
            </Field>
          </>
        )}

        {step.type === "UPDATE_TAG" && (
          <Field label="Tags to add (comma-separated)">
            <input
              value={Array.isArray(cfg.tags) ? (cfg.tags as string[]).join(", ") : ((cfg.tags as string) ?? "")}
              onChange={(e) => set("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
              placeholder="e.g. vip, customer" className={INPUT} />
          </Field>
        )}

        {step.type === "REMOVE_TAG" && (
          <Field label="Tags to remove (comma-separated)">
            <input
              value={Array.isArray(cfg.tags) ? (cfg.tags as string[]).join(", ") : ((cfg.tags as string) ?? "")}
              onChange={(e) => set("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
              placeholder="e.g. lead, trial" className={INPUT} />
            <p className="text-[11px] text-slate-400 mt-1">These tags will be stripped from the contact.</p>
          </Field>
        )}

        {step.type === "GO_TO" && (
          <>
            <Field label="Jump to step">
              <select
                value={(cfg.targetStepId as string) ?? ""}
                onChange={(e) => set("targetStepId", e.target.value)}
                className={INPUT}
              >
                <option value="">— Select a step —</option>
                {(allSteps ?? []).filter((s) => s.id !== step.id).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.type.replace(/_/g, " ")} — {s.id.slice(0, 8)}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1">The workflow will jump to this step when executed.</p>
            </Field>
            <Field label="Max jumps (loop guard)">
              <input
                type="number" min={1} max={10}
                value={(cfg.maxJumps as number) ?? 3}
                onChange={(e) => set("maxJumps", parseInt(e.target.value) || 3)}
                className={INPUT} />
              <p className="text-[11px] text-slate-400 mt-1">Stops looping after this many jumps to prevent infinite loops.</p>
            </Field>
          </>
        )}

        {step.type === "END" && (
          <p className="text-sm text-slate-400">This step marks the end of the workflow for enrolled contacts.</p>
        )}
      </div>

      {step.type !== "TRIGGER" && (
        <div className="px-5 py-4 border-t border-slate-100">
          <button onClick={onDelete}
            className="w-full flex items-center justify-center gap-2 text-rose-500 hover:bg-rose-50 border border-rose-200 rounded-xl px-4 py-2 text-sm font-medium transition-all">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
            Delete step
          </button>
        </div>
      )}
    </div>
  );
}
