"use client";

import { WorkflowStep } from "./workflow-builder";

const STEP_STYLES: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  TRIGGER:      { bg: "bg-indigo-50",  border: "border-indigo-200", text: "text-indigo-700",  icon: "⚡" },
  SEND_EMAIL:   { bg: "bg-sky-50",     border: "border-sky-200",    text: "text-sky-700",     icon: "✉️" },
  WAIT:         { bg: "bg-amber-50",   border: "border-amber-200",  text: "text-amber-700",   icon: "⏳" },
  IF_CONDITION: { bg: "bg-violet-50",  border: "border-violet-200", text: "text-violet-700",  icon: "🔀" },
  UPDATE_TAG:   { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", icon: "🏷️" },
  END:          { bg: "bg-rose-50",    border: "border-rose-200",   text: "text-rose-700",    icon: "⏹" },
};

const STEP_LABELS: Record<string, string> = {
  TRIGGER: "Trigger", SEND_EMAIL: "Send Email", WAIT: "Wait",
  IF_CONDITION: "If Condition", UPDATE_TAG: "Update Tag", END: "End",
};

function stepSummary(step: WorkflowStep): string {
  const c = step.config;
  switch (step.type) {
    case "TRIGGER":      return (c.label as string) ?? "Workflow starts";
    case "SEND_EMAIL":   return (c.subject as string) ?? "No subject set";
    case "WAIT":         return c.delayMinutes ? `Wait ${c.delayMinutes} min` : "Set delay";
    case "IF_CONDITION": return c.field ? `${c.field} ${c.operator} "${c.value}"` : "Set condition";
    case "UPDATE_TAG":   return c.tags ? `Add: ${(c.tags as string[]).join(", ")}` : "Set tags";
    case "END":          return "Workflow ends";
    default:             return "";
  }
}

export function StepNode({ step, selected, onSelect, onDelete, onDuplicate }: {
  step: WorkflowStep; selected: boolean;
  onSelect: () => void;
  onDelete?: () => void;
  onDuplicate: () => void;
}) {
  const style = STEP_STYLES[step.type] ?? STEP_STYLES.TRIGGER;

  return (
    <div
      onClick={onSelect}
      className={`group relative w-60 rounded-xl border-2 px-4 py-3 cursor-pointer transition-all select-none
        ${style.bg} ${style.border}
        ${selected ? "ring-2 ring-indigo-500 ring-offset-2 shadow-md" : "hover:shadow-sm hover:-translate-y-px"}
      `}
    >
      <div className="flex items-center gap-2">
        <span className="text-base leading-none shrink-0">{style.icon}</span>
        <div className="flex-1 min-w-0">
          <div className={`text-[11px] font-bold uppercase tracking-wider ${style.text}`}>
            {STEP_LABELS[step.type]}
          </div>
          <div className="text-xs text-slate-500 truncate mt-0.5">{stepSummary(step)}</div>
          {step.notes && (
            <div className="text-[10px] text-slate-400 italic truncate mt-0.5">📝 {step.notes}</div>
          )}
        </div>

        {/* Action buttons — visible on hover */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
            title="Duplicate step"
            className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
          </button>
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              title="Delete step"
              className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
