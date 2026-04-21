"use client";

import { WorkflowStep } from "./workflow-builder";

const TRIGGER_LABELS: Record<string, string> = {
  MANUAL:           "Manual enrollment",
  CONTACT_CREATED:  "Contact created",
  TAG_ADDED:        "Tag added",
  CAMPAIGN_OPENED:  "Campaign opened",
  CAMPAIGN_CLICKED: "Campaign clicked",
};

export function StepPanel({
  step, onChange, onClose, onDelete,
}: {
  step: WorkflowStep;
  onChange: (config: Record<string, unknown>) => void;
  onClose: () => void;
  onDelete: () => void;
}) {
  const cfg = step.config;

  function set(key: string, value: unknown) {
    onChange({ ...cfg, [key]: value });
  }

  return (
    <div className="w-72 bg-white border-l border-slate-200 flex flex-col shrink-0 overflow-y-auto">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Configure</p>
          <h3 className="text-sm font-bold text-slate-800 mt-0.5">{STEP_TYPE_LABEL[step.type]}</h3>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div className="flex-1 px-5 py-4 space-y-4">
        {step.type === "TRIGGER" && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Trigger type</label>
            <div className="text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
              {TRIGGER_LABELS[cfg.label as string] ?? (cfg.label as string) ?? "—"}
            </div>
            <p className="text-xs text-slate-400">The trigger is set when creating the workflow.</p>
          </div>
        )}

        {step.type === "SEND_EMAIL" && (
          <>
            <Field label="Subject">
              <input
                value={(cfg.subject as string) ?? ""}
                onChange={(e) => set("subject", e.target.value)}
                placeholder="Email subject line"
                className={INPUT}
              />
            </Field>
            <Field label="Body (HTML)">
              <textarea
                value={(cfg.htmlContent as string) ?? ""}
                onChange={(e) => set("htmlContent", e.target.value)}
                placeholder="<p>Hi {{name}},</p>"
                rows={6}
                className={INPUT + " resize-none font-mono text-xs"}
              />
            </Field>
          </>
        )}

        {step.type === "WAIT" && (
          <Field label="Delay (minutes)">
            <input
              type="number"
              min={1}
              value={(cfg.delayMinutes as number) ?? 60}
              onChange={(e) => set("delayMinutes", parseInt(e.target.value) || 60)}
              className={INPUT}
            />
          </Field>
        )}

        {step.type === "IF_CONDITION" && (
          <>
            <Field label="Field">
              <select
                value={(cfg.field as string) ?? "tag"}
                onChange={(e) => set("field", e.target.value)}
                className={INPUT}
              >
                <option value="tag">Tag</option>
              </select>
            </Field>
            <Field label="Operator">
              <select
                value={(cfg.operator as string) ?? "includes"}
                onChange={(e) => set("operator", e.target.value)}
                className={INPUT}
              >
                <option value="includes">includes</option>
                <option value="excludes">excludes</option>
              </select>
            </Field>
            <Field label="Value">
              <input
                value={(cfg.value as string) ?? ""}
                onChange={(e) => set("value", e.target.value)}
                placeholder="e.g. lead"
                className={INPUT}
              />
            </Field>
          </>
        )}

        {step.type === "UPDATE_TAG" && (
          <Field label="Tags to add (comma-separated)">
            <input
              value={Array.isArray(cfg.tags) ? (cfg.tags as string[]).join(", ") : ((cfg.tags as string) ?? "")}
              onChange={(e) => set("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
              placeholder="e.g. vip, customer"
              className={INPUT}
            />
          </Field>
        )}

        {step.type === "END" && (
          <p className="text-sm text-slate-400">This step marks the end of the workflow for enrolled contacts.</p>
        )}
      </div>

      {step.type !== "TRIGGER" && (
        <div className="px-5 py-4 border-t border-slate-100">
          <button
            onClick={onDelete}
            className="w-full flex items-center justify-center gap-2 text-rose-500 hover:bg-rose-50 border border-rose-200 rounded-xl px-4 py-2 text-sm font-medium transition-all"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
              <path d="M9 6V4h6v2"/>
            </svg>
            Delete step
          </button>
        </div>
      )}
    </div>
  );
}

const STEP_TYPE_LABEL: Record<string, string> = {
  TRIGGER:      "Trigger",
  SEND_EMAIL:   "Send Email",
  WAIT:         "Wait",
  IF_CONDITION: "If Condition",
  UPDATE_TAG:   "Update Tag",
  END:          "End",
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
