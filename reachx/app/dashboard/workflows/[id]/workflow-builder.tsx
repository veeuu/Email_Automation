"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { StepNode } from "./step-node";
import { StepPanel } from "./step-panel";

export type StepType = "TRIGGER" | "SEND_EMAIL" | "WAIT" | "IF_CONDITION" | "UPDATE_TAG" | "END";

export interface WorkflowStep {
  id: string;
  type: StepType;
  config: Record<string, unknown>;
  positionX: number;
  positionY: number;
  parentId: string | null;
  branch: string | null;
  order: number;
}

interface Workflow {
  id: string;
  name: string;
  status: string;
  triggerType: string;
  steps: WorkflowStep[];
}

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

const STEP_TYPES: { type: StepType; label: string; color: string; icon: string }[] = [
  { type: "SEND_EMAIL",   label: "Send Email",    color: "bg-indigo-50 border-indigo-200 text-indigo-700",  icon: "✉️" },
  { type: "WAIT",         label: "Wait",          color: "bg-amber-50 border-amber-200 text-amber-700",     icon: "⏳" },
  { type: "IF_CONDITION", label: "If Condition",  color: "bg-violet-50 border-violet-200 text-violet-700",  icon: "⚡" },
  { type: "UPDATE_TAG",   label: "Update Tag",    color: "bg-emerald-50 border-emerald-200 text-emerald-700", icon: "🏷️" },
  { type: "END",          label: "End",           color: "bg-rose-50 border-rose-200 text-rose-700",        icon: "⏹" },
];

export function WorkflowBuilder({ workflow: initial }: { workflow: Workflow }) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [status, setStatus] = useState(initial.status);
  const [steps, setSteps] = useState<WorkflowStep[]>(() => {
    if (initial.steps.length > 0) return initial.steps;
    // Default: one trigger step
    return [{
      id: generateId(),
      type: "TRIGGER",
      config: { label: initial.triggerType },
      positionX: 0, positionY: 0,
      parentId: null, branch: null, order: 0,
    }];
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const selectedStep = steps.find((s) => s.id === selectedId) ?? null;

  const addStep = useCallback((parentId: string, branch: string | null, type: StepType) => {
    const parent = steps.find((s) => s.id === parentId);
    const newStep: WorkflowStep = {
      id: generateId(),
      type,
      config: {},
      positionX: (parent?.positionX ?? 0),
      positionY: (parent?.positionY ?? 0) + 1,
      parentId,
      branch,
      order: steps.length,
    };
    setSteps((prev) => [...prev, newStep]);
    setSelectedId(newStep.id);
  }, [steps]);

  const updateStep = useCallback((id: string, config: Record<string, unknown>) => {
    setSteps((prev) => prev.map((s) => s.id === id ? { ...s, config } : s));
  }, []);

  const deleteStep = useCallback((id: string) => {
    // Also remove all descendants
    const toDelete = new Set<string>();
    const collect = (sid: string) => {
      toDelete.add(sid);
      steps.filter((s) => s.parentId === sid).forEach((s) => collect(s.id));
    };
    collect(id);
    setSteps((prev) => prev.filter((s) => !toDelete.has(s.id)));
    setSelectedId(null);
  }, [steps]);

  async function save() {
    setSaving(true);
    try {
      await fetch(`/api/workflows/${initial.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, status }),
      });
      await fetch(`/api/workflows/${initial.id}/steps`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ steps }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  // Build tree for rendering
  const rootSteps = steps.filter((s) => s.parentId === null);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-4 shrink-0">
        <button onClick={() => router.push("/dashboard/workflows")} className="text-slate-400 hover:text-slate-700 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>
          </svg>
        </button>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="font-semibold text-slate-900 text-sm bg-transparent border-none outline-none focus:ring-0 min-w-0 flex-1"
        />
        <div className="flex items-center gap-2 ml-auto shrink-0">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          <button
            onClick={save}
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
          >
            {saving ? "Saving..." : saved ? "Saved ✓" : "Save"}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Canvas */}
        <div className="flex-1 overflow-auto bg-[#f8f9fb] p-10">
          <div className="flex flex-col items-center gap-0 min-w-max mx-auto">
            {rootSteps.map((step) => (
              <StepTree
                key={step.id}
                step={step}
                steps={steps}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onAdd={addStep}
                onDelete={deleteStep}
                stepTypes={STEP_TYPES}
              />
            ))}
          </div>
        </div>

        {/* Right panel */}
        {selectedStep && (
          <StepPanel
            step={selectedStep}
            onChange={(config) => updateStep(selectedStep.id, config)}
            onClose={() => setSelectedId(null)}
            onDelete={() => deleteStep(selectedStep.id)}
          />
        )}
      </div>
    </div>
  );
}

function StepTree({
  step, steps, selectedId, onSelect, onAdd, onDelete, stepTypes,
}: {
  step: WorkflowStep;
  steps: WorkflowStep[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: (parentId: string, branch: string | null, type: StepType) => void;
  onDelete: (id: string) => void;
  stepTypes: typeof STEP_TYPES;
}) {
  const children = steps.filter((s) => s.parentId === step.id);
  const yesChild = children.find((s) => s.branch === "yes");
  const noChild = children.find((s) => s.branch === "no");
  const linearChild = children.find((s) => s.branch === null);
  const isBranching = step.type === "IF_CONDITION";

  return (
    <div className="flex flex-col items-center">
      <StepNode
        step={step}
        selected={selectedId === step.id}
        onSelect={() => onSelect(step.id)}
        onDelete={step.type !== "TRIGGER" ? () => onDelete(step.id) : undefined}
      />

      {/* Connector + add button */}
      {step.type !== "END" && (
        isBranching ? (
          <div className="flex items-start gap-16 mt-0">
            {/* Yes branch */}
            <div className="flex flex-col items-center">
              <div className="flex flex-col items-center">
                <div className="w-px h-6 bg-slate-300" />
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">Yes</span>
                <div className="w-px h-4 bg-slate-300" />
              </div>
              {yesChild ? (
                <StepTree step={yesChild} steps={steps} selectedId={selectedId} onSelect={onSelect} onAdd={onAdd} onDelete={onDelete} stepTypes={stepTypes} />
              ) : (
                <AddStepButton parentId={step.id} branch="yes" onAdd={onAdd} stepTypes={stepTypes} />
              )}
            </div>
            {/* No branch */}
            <div className="flex flex-col items-center">
              <div className="flex flex-col items-center">
                <div className="w-px h-6 bg-slate-300" />
                <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">No</span>
                <div className="w-px h-4 bg-slate-300" />
              </div>
              {noChild ? (
                <StepTree step={noChild} steps={steps} selectedId={selectedId} onSelect={onSelect} onAdd={onAdd} onDelete={onDelete} stepTypes={stepTypes} />
              ) : (
                <AddStepButton parentId={step.id} branch="no" onAdd={onAdd} stepTypes={stepTypes} />
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="w-px h-4 bg-slate-300" />
            {linearChild ? (
              <StepTree step={linearChild} steps={steps} selectedId={selectedId} onSelect={onSelect} onAdd={onAdd} onDelete={onDelete} stepTypes={stepTypes} />
            ) : (
              <AddStepButton parentId={step.id} branch={null} onAdd={onAdd} stepTypes={stepTypes} />
            )}
          </>
        )
      )}
    </div>
  );
}

function AddStepButton({
  parentId, branch, onAdd, stepTypes,
}: {
  parentId: string;
  branch: string | null;
  onAdd: (parentId: string, branch: string | null, type: StepType) => void;
  stepTypes: typeof STEP_TYPES;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex flex-col items-center">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-7 h-7 rounded-full border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all text-lg leading-none"
      >
        +
      </button>
      {open && (
        <div className="absolute top-9 z-20 bg-white border border-slate-200 rounded-xl shadow-lg p-2 w-44 space-y-0.5">
          {stepTypes.map((st) => (
            <button
              key={st.type}
              onClick={() => { onAdd(parentId, branch, st.type); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 text-left text-sm text-slate-700 transition-colors"
            >
              <span>{st.icon}</span>
              <span>{st.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
