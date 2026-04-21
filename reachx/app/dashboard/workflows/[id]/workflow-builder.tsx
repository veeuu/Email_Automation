"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { StepNode } from "./step-node";
import { StepPanel } from "./step-panel";

export type StepType = "TRIGGER" | "SEND_EMAIL" | "WAIT" | "IF_CONDITION" | "UPDATE_TAG" | "END";

export interface WorkflowStep {
  id: string;
  type: StepType;
  config: Record<string, unknown>;
  notes: string;
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
  allowReEnrollment: boolean;
  exitOnUnsubscribe: boolean;
  steps: WorkflowStep[];
}

export type Tab = "builder" | "enrollments" | "stats" | "versions";

function genId() { return Math.random().toString(36).slice(2, 10); }

export const STEP_TYPES: { type: StepType; label: string; icon: string }[] = [
  { type: "SEND_EMAIL",   label: "Send Email",   icon: "✉️" },
  { type: "WAIT",         label: "Wait",         icon: "⏳" },
  { type: "IF_CONDITION", label: "If Condition", icon: "⚡" },
  { type: "UPDATE_TAG",   label: "Update Tag",   icon: "🏷️" },
  { type: "END",          label: "End",          icon: "⏹" },
];

export function WorkflowBuilder({ workflow: initial }: { workflow: Workflow }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("builder");
  const [name, setName] = useState(initial.name);
  const [status, setStatus] = useState(initial.status);
  const [allowReEnrollment, setAllowReEnrollment] = useState(initial.allowReEnrollment);
  const [exitOnUnsubscribe, setExitOnUnsubscribe] = useState(initial.exitOnUnsubscribe);
  const [showSettings, setShowSettings] = useState(false);

  // Steps with undo/redo
  const [history, setHistory] = useState<WorkflowStep[][]>([]);
  const [future, setFuture] = useState<WorkflowStep[][]>([]);
  const [steps, setStepsRaw] = useState<WorkflowStep[]>(() => {
    if (initial.steps.length > 0) return initial.steps.map((s) => ({ ...s, notes: s.notes ?? "" }));
    return [{ id: genId(), type: "TRIGGER", config: { label: initial.triggerType }, notes: "", positionX: 0, positionY: 0, parentId: null, branch: null, order: 0 }];
  });

  const setSteps = useCallback((updater: WorkflowStep[] | ((prev: WorkflowStep[]) => WorkflowStep[])) => {
    setStepsRaw((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      setHistory((h) => [...h.slice(-19), prev]);
      setFuture([]);
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    setHistory((h) => {
      if (!h.length) return h;
      const prev = h[h.length - 1];
      setFuture((f) => [steps, ...f]);
      setStepsRaw(prev);
      return h.slice(0, -1);
    });
  }, [steps]);

  const redo = useCallback(() => {
    setFuture((f) => {
      if (!f.length) return f;
      const next = f[0];
      setHistory((h) => [...h, steps]);
      setStepsRaw(next);
      return f.slice(1);
    });
  }, [steps]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) { e.preventDefault(); redo(); }
      if (e.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo]);

  // Zoom & pan
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const selectedStep = steps.find((s) => s.id === selectedId) ?? null;

  const addStep = useCallback((parentId: string, branch: string | null, type: StepType) => {
    const newStep: WorkflowStep = {
      id: genId(), type, config: {}, notes: "",
      positionX: 0, positionY: 0,
      parentId, branch, order: steps.length,
    };
    setSteps((prev) => [...prev, newStep]);
    setSelectedId(newStep.id);
  }, [steps.length, setSteps]);

  const updateStep = useCallback((id: string, patch: Partial<WorkflowStep>) => {
    setSteps((prev) => prev.map((s) => s.id === id ? { ...s, ...patch } : s));
  }, [setSteps]);

  const deleteStep = useCallback((id: string) => {
    const toDelete = new Set<string>();
    const collect = (sid: string) => {
      toDelete.add(sid);
      steps.filter((s) => s.parentId === sid).forEach((s) => collect(s.id));
    };
    collect(id);
    setSteps((prev) => prev.filter((s) => !toDelete.has(s.id)));
    setSelectedId(null);
  }, [steps, setSteps]);

  const duplicateStep = useCallback((id: string) => {
    const src = steps.find((s) => s.id === id);
    if (!src) return;
    const newId = genId();
    const copy: WorkflowStep = { ...src, id: newId, parentId: null, branch: null, order: steps.length, notes: src.notes + " (copy)" };
    setSteps((prev) => [...prev, copy]);
    setSelectedId(newId);
  }, [steps, setSteps]);

  async function save() {
    setSaving(true);
    try {
      await fetch(`/api/workflows/${initial.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, status, allowReEnrollment, exitOnUnsubscribe }),
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

  const rootSteps = steps.filter((s) => s.parentId === null);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-200 px-5 py-2.5 flex items-center gap-3 shrink-0">
        <button onClick={() => router.push("/dashboard/workflows")} className="text-slate-400 hover:text-slate-700 transition-colors shrink-0">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
        </button>
        <input value={name} onChange={(e) => setName(e.target.value)} className="font-semibold text-slate-900 text-sm bg-transparent border-none outline-none min-w-0 flex-1" />

        {/* Tabs */}
        <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5 mx-2">
          {(["builder","enrollments","stats","versions"] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-all ${tab === t ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              {t}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Undo/Redo */}
          <button onClick={undo} disabled={!history.length} title="Undo (Ctrl+Z)" className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 transition-all">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
          </button>
          <button onClick={redo} disabled={!future.length} title="Redo (Ctrl+Y)" className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 transition-all">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/></svg>
          </button>
          <div className="w-px h-4 bg-slate-200" />
          <button onClick={() => setShowSettings((v) => !v)} title="Workflow settings" className={`p-1.5 rounded-lg transition-all ${showSettings ? "bg-indigo-50 text-indigo-600" : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"}`}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </button>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          <button onClick={save} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all">
            {saving ? "Saving..." : saved ? "Saved ✓" : "Save"}
          </button>
        </div>
      </div>

      {/* Settings drawer */}
      {showSettings && (
        <div className="bg-indigo-50 border-b border-indigo-100 px-6 py-3 flex items-center gap-8 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={allowReEnrollment} onChange={(e) => setAllowReEnrollment(e.target.checked)} className="rounded" />
            <span className="text-slate-700 text-xs font-medium">Allow re-enrollment</span>
            <span className="text-slate-400 text-xs">Contacts can enter this workflow more than once</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={exitOnUnsubscribe} onChange={(e) => setExitOnUnsubscribe(e.target.checked)} className="rounded" />
            <span className="text-slate-700 text-xs font-medium">Exit on unsubscribe</span>
            <span className="text-slate-400 text-xs">Auto-unenroll contacts who unsubscribe</span>
          </label>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {tab === "builder" && (
          <>
            {/* Canvas with zoom/pan */}
            <div
              className="flex-1 overflow-hidden bg-[#f8f9fb] relative cursor-grab active:cursor-grabbing"
              style={{ backgroundImage: "radial-gradient(circle, #d1d5db 1px, transparent 1px)", backgroundSize: "24px 24px" }}
              onMouseDown={(e) => {
                if (e.target === e.currentTarget || (e.target as HTMLElement).closest("[data-canvas]")) {
                  isPanning.current = true;
                  panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
                }
              }}
              onMouseMove={(e) => {
                if (isPanning.current) setPan({ x: e.clientX - panStart.current.x, y: e.clientY - panStart.current.y });
              }}
              onMouseUp={() => { isPanning.current = false; }}
              onMouseLeave={() => { isPanning.current = false; }}
              onWheel={(e) => {
                e.preventDefault();
                setZoom((z) => Math.min(2, Math.max(0.3, z - e.deltaY * 0.001)));
              }}
            >
              {/* Zoom controls */}
              <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm z-10">
                <button onClick={() => setZoom((z) => Math.max(0.3, z - 0.1))} className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-lg text-lg leading-none">−</button>
                <span className="text-xs text-slate-500 w-10 text-center">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom((z) => Math.min(2, z + 0.1))} className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-lg text-lg leading-none">+</button>
                <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="w-7 h-7 flex items-center justify-center text-slate-400 hover:bg-slate-100 rounded-lg text-xs">↺</button>
              </div>

              <div data-canvas="true" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: "center top", transition: isPanning.current ? "none" : undefined }} className="flex flex-col items-center pt-10 pb-20 min-h-full">
                {rootSteps.map((step) => (
                  <StepTree key={step.id} step={step} steps={steps} selectedId={selectedId}
                    onSelect={setSelectedId} onAdd={addStep} onDelete={deleteStep} onDuplicate={duplicateStep} />
                ))}
              </div>
            </div>

            {selectedStep && (
              <StepPanel
                step={selectedStep}
                onChange={(patch) => updateStep(selectedStep.id, patch)}
                onClose={() => setSelectedId(null)}
                onDelete={() => deleteStep(selectedStep.id)}
                onDuplicate={() => duplicateStep(selectedStep.id)}
              />
            )}
          </>
        )}

        {tab === "enrollments" && <EnrollmentsTab workflowId={initial.id} />}
        {tab === "stats" && <StatsTab workflowId={initial.id} steps={steps} />}
        {tab === "versions" && <VersionsTab workflowId={initial.id} />}
      </div>
    </div>
  );
}

// ─── StepTree ────────────────────────────────────────────────────────────────

function StepTree({ step, steps, selectedId, onSelect, onAdd, onDelete, onDuplicate }: {
  step: WorkflowStep; steps: WorkflowStep[]; selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: (parentId: string, branch: string | null, type: StepType) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}) {
  const children = steps.filter((s) => s.parentId === step.id);
  const yesChild = children.find((s) => s.branch === "yes");
  const noChild  = children.find((s) => s.branch === "no");
  const linearChild = children.find((s) => s.branch === null);
  const isBranching = step.type === "IF_CONDITION";

  return (
    <div className="flex flex-col items-center">
      <StepNode step={step} selected={selectedId === step.id}
        onSelect={() => onSelect(step.id)}
        onDelete={step.type !== "TRIGGER" ? () => onDelete(step.id) : undefined}
        onDuplicate={() => onDuplicate(step.id)}
      />

      {step.type !== "END" && (
        isBranching ? (
          <div className="flex items-start gap-16 mt-0">
            {[{ child: yesChild, branch: "yes", label: "Yes", cls: "text-emerald-600 bg-emerald-50 border-emerald-200" },
              { child: noChild,  branch: "no",  label: "No",  cls: "text-rose-600 bg-rose-50 border-rose-200" }].map(({ child, branch, label, cls }) => (
              <div key={branch} className="flex flex-col items-center">
                <div className="flex flex-col items-center">
                  <div className="w-px h-6 bg-slate-300" />
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cls}`}>{label}</span>
                  <div className="w-px h-4 bg-slate-300" />
                </div>
                {child
                  ? <StepTree step={child} steps={steps} selectedId={selectedId} onSelect={onSelect} onAdd={onAdd} onDelete={onDelete} onDuplicate={onDuplicate} />
                  : <AddStepButton parentId={step.id} branch={branch} onAdd={onAdd} />}
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="w-px h-4 bg-slate-300" />
            {linearChild
              ? <StepTree step={linearChild} steps={steps} selectedId={selectedId} onSelect={onSelect} onAdd={onAdd} onDelete={onDelete} onDuplicate={onDuplicate} />
              : <AddStepButton parentId={step.id} branch={null} onAdd={onAdd} />}
          </>
        )
      )}
    </div>
  );
}

function AddStepButton({ parentId, branch, onAdd }: {
  parentId: string; branch: string | null;
  onAdd: (parentId: string, branch: string | null, type: StepType) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative flex flex-col items-center">
      <button onClick={() => setOpen((v) => !v)}
        className="w-7 h-7 rounded-full border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all text-lg leading-none">
        +
      </button>
      {open && (
        <div className="absolute top-9 z-20 bg-white border border-slate-200 rounded-xl shadow-lg p-2 w-44 space-y-0.5">
          {STEP_TYPES.map((st) => (
            <button key={st.type} onClick={() => { onAdd(parentId, branch, st.type); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 text-left text-sm text-slate-700 transition-colors">
              <span>{st.icon}</span><span>{st.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Enrollments Tab ─────────────────────────────────────────────────────────

function EnrollmentsTab({ workflowId }: { workflowId: string }) {
  const [enrollments, setEnrollments] = useState<Array<{
    id: string; contactEmail: string; status: string; errorMessage: string | null;
    enrolledAt: string; updatedAt: string; events: Array<{ eventType: string; createdAt: string }>;
  }>>([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const q = filter !== "ALL" ? `?status=${filter}` : "";
    fetch(`/api/workflows/${workflowId}/enrollments${q}`)
      .then((r) => r.json()).then(setEnrollments).finally(() => setLoading(false));
  }, [workflowId, filter]);

  const STATUS_STYLE: Record<string, string> = {
    ACTIVE:    "text-sky-600 bg-sky-50 border-sky-200",
    COMPLETED: "text-emerald-600 bg-emerald-50 border-emerald-200",
    FAILED:    "text-rose-600 bg-rose-50 border-rose-200",
    PAUSED:    "text-amber-600 bg-amber-50 border-amber-200",
  };

  return (
    <div className="flex-1 overflow-auto p-6 space-y-4">
      <div className="flex items-center gap-2">
        {["ALL","ACTIVE","COMPLETED","FAILED","PAUSED"].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${filter === s ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"}`}>
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-sm text-slate-400 py-8 text-center">Loading...</div>
      ) : enrollments.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center">
          <p className="text-slate-500 font-medium">No enrollments yet</p>
          <p className="text-slate-400 text-sm mt-1">Contacts will appear here once enrolled in this workflow.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["Contact", "Status", "Last Event", "Enrolled", "Updated"].map((h, i) => (
                  <th key={h} className={`px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider ${i === 0 ? "text-left" : "text-right"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {enrollments.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-slate-800">{e.contactEmail}</td>
                  <td className="px-5 py-3 text-right">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full border font-semibold ${STATUS_STYLE[e.status] ?? ""}`}>{e.status}</span>
                    {e.errorMessage && <div className="text-[10px] text-rose-400 mt-0.5 truncate max-w-[160px] ml-auto">{e.errorMessage}</div>}
                  </td>
                  <td className="px-5 py-3 text-right text-slate-500 text-xs">{e.events[0]?.eventType ?? "—"}</td>
                  <td className="px-5 py-3 text-right text-slate-400 text-xs">{new Date(e.enrolledAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-right text-slate-400 text-xs">{new Date(e.updatedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Stats Tab ────────────────────────────────────────────────────────────────

interface StatsData {
  total: number; active: number; completed: number; failed: number;
  completionRate: number; emailSent: number; emailOpened: number; emailClicked: number;
  openRate: number; clickRate: number;
  stepFunnel: Array<{ stepId: string; stepType: string; reached: number }>;
  activity: Array<{ id: string; eventType: string; createdAt: string; enrollment: { contactEmail: string } }>;
}

function StatsTab({ workflowId, steps }: { workflowId: string; steps: WorkflowStep[] }) {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/workflows/${workflowId}/stats`)
      .then((r) => r.json()).then(setData).finally(() => setLoading(false));
  }, [workflowId]);

  if (loading) return <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">Loading stats...</div>;
  if (!data) return null;

  const STEP_LABELS: Record<string, string> = { TRIGGER: "Trigger", SEND_EMAIL: "Send Email", WAIT: "Wait", IF_CONDITION: "If Condition", UPDATE_TAG: "Update Tag", END: "End" };

  return (
    <div className="flex-1 overflow-auto p-6 space-y-6">
      {/* Overview cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Enrolled", value: data.total, color: "text-slate-800" },
          { label: "Active",         value: data.active, color: "text-sky-600" },
          { label: "Completed",      value: data.completed, color: "text-emerald-600" },
          { label: "Failed",         value: data.failed, color: "text-rose-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl px-4 py-3.5">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Completion Rate", value: `${data.completionRate}%`, color: "text-violet-600" },
          { label: "Email Open Rate", value: `${data.openRate}%`,       color: "text-indigo-600" },
          { label: "Click Rate",      value: `${data.clickRate}%`,      color: "text-sky-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl px-4 py-3.5">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Step funnel */}
      {data.stepFunnel.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Step Funnel</p>
          {data.stepFunnel.map((sf) => {
            const step = steps.find((s) => s.id === sf.stepId);
            const pct = data.total > 0 ? Math.round((sf.reached / data.total) * 100) : 0;
            return (
              <div key={sf.stepId} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">{STEP_LABELS[sf.stepType]} {step?.config?.subject ? `— ${step.config.subject as string}` : ""}</span>
                  <span className="text-slate-400">{sf.reached} ({pct}%)</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Activity log */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Activity Log</p>
        {data.activity.length === 0 ? (
          <p className="text-sm text-slate-400">No activity yet.</p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {data.activity.map((a) => (
              <div key={a.id} className="flex items-center gap-3 text-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                <span className="text-slate-500 font-medium">{a.enrollment.contactEmail}</span>
                <span className="text-slate-400">{a.eventType.replace(/_/g, " ").toLowerCase()}</span>
                <span className="text-slate-300 ml-auto">{new Date(a.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Versions Tab ─────────────────────────────────────────────────────────────

function VersionsTab({ workflowId }: { workflowId: string }) {
  const [versions, setVersions] = useState<Array<{ id: string; version: number; savedAt: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/workflows/${workflowId}/versions`)
      .then((r) => r.json()).then(setVersions).finally(() => setLoading(false));
  }, [workflowId]);

  async function restore(versionId: string) {
    if (!confirm("Restore this version? Current steps will be replaced.")) return;
    setRestoring(versionId);
    await fetch(`/api/workflows/${workflowId}/versions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ versionId }),
    });
    setRestoring(null);
    window.location.reload();
  }

  return (
    <div className="flex-1 overflow-auto p-6 space-y-4">
      <p className="text-xs text-slate-400">Up to 10 versions are saved automatically each time you save the workflow.</p>
      {loading ? (
        <div className="text-sm text-slate-400 py-8 text-center">Loading...</div>
      ) : versions.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center">
          <p className="text-slate-500 font-medium">No versions saved yet</p>
          <p className="text-slate-400 text-sm mt-1">Versions are created automatically when you save.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          {versions.map((v, i) => (
            <div key={v.id} className={`flex items-center gap-4 px-5 py-3.5 ${i < versions.length - 1 ? "border-b border-slate-100" : ""}`}>
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                v{v.version}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-700">Version {v.version}</div>
                <div className="text-xs text-slate-400">{new Date(v.savedAt).toLocaleString()}</div>
              </div>
              {i === 0 && <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">Latest</span>}
              <button onClick={() => restore(v.id)} disabled={restoring === v.id}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-50 transition-colors">
                {restoring === v.id ? "Restoring..." : "Restore"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
