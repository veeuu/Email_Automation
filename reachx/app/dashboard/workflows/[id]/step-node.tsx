"use client";

import { WorkflowStep } from "./workflow-builder";

const STEP_STYLES: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  TRIGGER:      { bg: "bg-indigo-50",  border: "border-indigo-200", text: "text-indigo-700",  icon: "⚡" },
  SEND_EMAIL:   { bg: "bg-sky-50",     border: "border-sky-200",    text: "text-sky-700",     icon: "✉️" },
  WAIT:         { bg: "bg-amber-50",   border: "border-amber-200",  text: "text-amber-700",   icon: "⏳" },
  IF_CONDITION: { bg: "bg-violet-50",  border: "border-violet-200", text: "text-violet-700",  icon: "⚡" },
  UPDATE_TAG:   { bg: "bg-emerald-50", border: "border-emerald-200","text": "text-emerald-700", icon: "🏷️" },
  END:          { bg: "bg-rose-50",    border: "border-rose-200",   text: "text-rose-700",    icon: "⏹" },
};

const STEP_LABELS: Record<string, string> = {
  TRIGGER:      "Trigger",
  SEND_EMAIL:   "Send Email",
  WAIT:         "Wait",
  IF_CONDITION: "If Condition",
  UPDATE_TAG:   "Update Tag",
  END:          "End",
};

function stepSummary(step: WorkflowStep): string {
  const cfg = step.config;
  switch (step.type) {
    case "TRIGGER":      return (cfg.label as string) ?? "Workflow starts";
    case "SEND_EMAIL":   return (cfg.subject as string) ?? "No subject set";
    case "WAIT":         return cfg.delayMinutes ? `Wait ${cfg.delayMinutes} min` : "Set delay";
    case "IF_CONDITION": return cfg.field ? `${cfg.field} ${cfg.operator} "${cfg.value}"` : "Set condition";
    case "UPDATE_TAG":   return cfg.tags ? `Add: ${(cfg.tags as string[]).join(", ")}` : "Set tags";
    case "END":          return "Workflow ends";
    default:             return "";
  }
}

export function StepNode({
  step, selected, onSelect, onDelete,
}: {
  step: WorkflowStep;
  selected: boolean;
  onSelect: () => void;
  onDelete?: () => void;
}) {
  const style = STEP_STYLES[step.type] ?? STEP_STYLES.TRIGGER;

  return (
    <div
      onClick={onSelect}
      className={`relative w-56 rounded-xl border-2 px-4 py-3 cursor-pointer transition-all select-none
        ${style.bg} ${style.border}
        ${selected ? "ring-2 ring-indigo-500 ring-offset-2 shadow-md" : "hover:shadow-sm hover:-translate-y-px"}
      `}
    >
      <div className="flex items-center gap-2">
        <span className="text-base leading-none">{style.icon}</span>
        <div className="flex-1 min-w-0">
          <div className={`text-[11px] font-bold uppercase tracking-wider ${style.text}`}>
            {STEP_LABELS[step.type]}
          </div>
          <div className="text-xs text-slate-500 truncate mt-0.5">{stepSummary(step)}</div>
        </div>
        {onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="opacity-0 group-hover:opacity-100 hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all ml-1 shrink-0"
            title="Delete step"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
