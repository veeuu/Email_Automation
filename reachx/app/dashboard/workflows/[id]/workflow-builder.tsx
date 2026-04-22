"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
  id: string; name: string; status: string; triggerType: string;
  allowReEnrollment: boolean; exitOnUnsubscribe: boolean;
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

// Node dimensions
const NODE_W = 200;
const NODE_H = 72;
const H_GAP  = 80;   // horizontal gap between nodes
const V_GAP  = 80;   // vertical gap for branches

// Auto-layout: assign positions based on tree structure
function autoLayout(steps: WorkflowStep[]): WorkflowStep[] {
  if (steps.length === 0) return steps;
  const posMap = new Map<string, { x: number; y: number }>();

  function place(id: string, x: number, y: number) {
    posMap.set(id, { x, y });
    const children = steps.filter((s) => s.parentId === id);
    const yesChild = children.find((s) => s.branch === "yes");
    const noChild  = children.find((s) => s.branch === "no");
    const linear   = children.find((s) => s.branch === null);
    if (linear) {
      place(linear.id, x + NODE_W + H_GAP, y);
    }
    if (yesChild) {
      place(yesChild.id, x + NODE_W + H_GAP, y - NODE_H / 2 - V_GAP / 2);
    }
    if (noChild) {
      place(noChild.id, x + NODE_W + H_GAP, y + NODE_H / 2 + V_GAP / 2);
    }
  }

  const roots = steps.filter((s) => s.parentId === null);
  roots.forEach((r, i) => place(r.id, 60, 60 + i * (NODE_H + V_GAP)));

  return steps.map((s) => {
    const pos = posMap.get(s.id);
    return pos ? { ...s, positionX: pos.x, positionY: pos.y } : s;
  });
}

export function WorkflowBuilder({ workflow: initial }: { workflow: Workflow }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("builder");
  const [name, setName] = useState(initial.name);
  const [status, setStatus] = useState(initial.status);
  const [allowReEnrollment, setAllowReEnrollment] = useState(initial.allowReEnrollment);
  const [exitOnUnsubscribe, setExitOnUnsubscribe] = useState(initial.exitOnUnsubscribe);
  const [showSettings, setShowSettings] = useState(false);

  // undo/redo
  const [history, setHistory] = useState<WorkflowStep[][]>([]);
  const [future,  setFuture]  = useState<WorkflowStep[][]>([]);

  const initSteps = (): WorkflowStep[] => {
    const raw = initial.steps.length > 0
      ? initial.steps.map((s) => ({ ...s, notes: s.notes ?? "" }))
      : [{ id: genId(), type: "TRIGGER" as StepType, config: { label: initial.triggerType }, notes: "", positionX: 60, positionY: 200, parentId: null, branch: null, order: 0 }];
    return autoLayout(raw);
  };

  const [steps, setStepsRaw] = useState<WorkflowStep[]>(initSteps);

  const setSteps = useCallback((updater: WorkflowStep[] | ((p: WorkflowStep[]) => WorkflowStep[])) => {
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

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) { e.preventDefault(); redo(); }
      if (e.key === "Escape") setSelectedId(null);
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        const el = document.activeElement;
        if (el?.tagName !== "INPUT" && el?.tagName !== "TEXTAREA") deleteStep(selectedId);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [undo, redo]);

  // Pan & zoom
  const [zoom, setZoom] = useState(1);
  const [pan,  setPan]  = useState({ x: 0, y: 0 });
  const canvasRef  = useRef<HTMLDivElement>(null);
  const isPanning  = useRef(false);
  const panStart   = useRef({ x: 0, y: 0 });

  // Attach wheel as non-passive so preventDefault() actually blocks page scroll
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      setZoom((z) => Math.min(2, Math.max(0.25, z - e.deltaY * 0.001)));
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  // Drag node
  const dragging   = useRef<{ id: string; ox: number; oy: number } | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [addMenuFor, setAddMenuFor] = useState<{ parentId: string; branch: string | null } | null>(null);

  // Test run
  const [showTest, setShowTest]     = useState(false);
  const [testEmail, setTestEmail]   = useState("");
  const [testRunning, setTestRunning] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  async function runTest() {
    if (!testEmail.trim()) return;
    setTestRunning(true);
    setTestResult(null);
    try {
      // First save current state so the test uses latest steps
      await fetch(`/api/workflows/${initial.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, status: "ACTIVE", allowReEnrollment: true, exitOnUnsubscribe }),
      });
      await fetch(`/api/workflows/${initial.id}/steps`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ steps }),
      });
      const res = await fetch(`/api/workflows/${initial.id}/enroll`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails: [testEmail.trim()] }),
      });
      const data = await res.json();
      if (res.ok) {
        setTestResult({ ok: true, message: `✓ Enrolled ${testEmail}` });
      } else {
        setTestResult({ ok: false, message: `✗ ${data.error ?? "Failed to enroll"}` });
      }
    } catch {
      setTestResult({ ok: false, message: "✗ Network error" });
    } finally {
      setTestRunning(false);
    }
  }

  const selectedStep = steps.find((s) => s.id === selectedId) ?? null;

  const addStep = useCallback((parentId: string, branch: string | null, type: StepType) => {
    const parent = steps.find((s) => s.id === parentId);
    const newStep: WorkflowStep = {
      id: genId(), type, config: {}, notes: "",
      positionX: (parent?.positionX ?? 60) + NODE_W + H_GAP,
      positionY: (parent?.positionY ?? 200) + (branch === "no" ? NODE_H + V_GAP : branch === "yes" ? -(NODE_H + V_GAP) : 0),
      parentId, branch, order: steps.length,
    };
    setSteps((prev) => autoLayout([...prev, newStep]));
    setSelectedId(newStep.id);
    setAddMenuFor(null);
  }, [steps, setSteps]);

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
    setSteps((prev) => autoLayout(prev.filter((s) => !toDelete.has(s.id))));
    setSelectedId(null);
  }, [steps, setSteps]);

  const duplicateStep = useCallback((id: string) => {
    const src = steps.find((s) => s.id === id);
    if (!src) return;
    const newId = genId();
    const copy: WorkflowStep = { ...src, id: newId, parentId: null, branch: null, order: steps.length,
      positionX: src.positionX + 20, positionY: src.positionY + 20 };
    setSteps((prev) => [...prev, copy]);
    setSelectedId(newId);
  }, [steps, setSteps]);

  async function save() {
    setSaving(true);
    try {
      await fetch(`/api/workflows/${initial.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, status, allowReEnrollment, exitOnUnsubscribe }),
      });
      await fetch(`/api/workflows/${initial.id}/steps`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ steps }),
      });
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    } finally { setSaving(false); }
  }

  // Canvas size for SVG
  const canvasW = Math.max(1400, ...steps.map((s) => s.positionX + NODE_W + 200));
  const canvasH = Math.max(800,  ...steps.map((s) => s.positionY + NODE_H + 200));

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* ── Top bar ── */}
      <div className="bg-white border-b border-slate-200 px-5 py-2.5 flex items-center gap-3 shrink-0 z-10">
        <button onClick={() => router.push("/dashboard/workflows")} className="text-slate-400 hover:text-slate-700 transition-colors shrink-0">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
        </button>
        <input value={name} onChange={(e) => setName(e.target.value)} className="font-semibold text-slate-900 text-sm bg-transparent border-none outline-none min-w-0 flex-1" />

        <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5 mx-2">
          {(["builder","enrollments","stats","versions"] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-all ${tab === t ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              {t}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button onClick={undo} disabled={!history.length} title="Undo (Ctrl+Z)" className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 transition-all">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
          </button>
          <button onClick={redo} disabled={!future.length} title="Redo (Ctrl+Y)" className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 transition-all">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/></svg>
          </button>
          <div className="w-px h-4 bg-slate-200 mx-0.5" />
          <button onClick={() => setShowSettings((v) => !v)} className={`p-1.5 rounded-lg transition-all ${showSettings ? "bg-indigo-50 text-indigo-600" : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"}`}>
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
          <button onClick={() => { setShowTest((v) => !v); setTestResult(null); }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${showTest ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"}`}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Test
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="bg-indigo-50 border-b border-indigo-100 px-6 py-3 flex items-center gap-8 shrink-0">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={allowReEnrollment} onChange={(e) => setAllowReEnrollment(e.target.checked)} className="rounded" />
            <span className="text-slate-700 text-xs font-medium">Allow re-enrollment</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={exitOnUnsubscribe} onChange={(e) => setExitOnUnsubscribe(e.target.checked)} className="rounded" />
            <span className="text-slate-700 text-xs font-medium">Exit on unsubscribe</span>
          </label>
        </div>
      )}

      {/* ── Test Run Panel ── */}
      {showTest && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-3 flex items-center gap-3 shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          <span className="text-xs font-semibold text-emerald-700">Test Run</span>
          <span className="text-xs text-emerald-600">Enter an email to enroll it and trigger the workflow immediately.</span>
          <input
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runTest()}
            placeholder="test@example.com"
            className="ml-2 border border-emerald-300 bg-white rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 w-56"
          />
          <button
            onClick={runTest}
            disabled={testRunning || !testEmail.trim()}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
          >
            {testRunning ? "Running..." : "Run"}
          </button>
          {testResult && (
            <span className={`text-xs font-medium ${testResult.ok ? "text-emerald-700" : "text-rose-600"}`}>
              {testResult.message}
            </span>
          )}
          <button onClick={() => setShowTest(false)} className="ml-auto text-emerald-400 hover:text-emerald-700 transition-colors">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {tab === "builder" && (
          <>
            {/* ── Canvas ── */}
            <div
              ref={canvasRef}
              className="flex-1 overflow-hidden relative select-none"
              style={{ background: "#f8fafc", backgroundImage: "radial-gradient(circle, #cbd5e1 1px, transparent 1px)", backgroundSize: "28px 28px", cursor: isPanning.current ? "grabbing" : "grab" }}
              onMouseDown={(e) => {
                if ((e.target as HTMLElement).closest("[data-node]")) return;
                isPanning.current = true;
                panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
              }}
              onMouseMove={(e) => {
                if (dragging.current) {
                  const { id, ox, oy } = dragging.current;
                  const nx = (e.clientX - ox) / zoom;
                  const ny = (e.clientY - oy) / zoom;
                  setStepsRaw((prev) => prev.map((s) => s.id === id ? { ...s, positionX: Math.max(0, nx), positionY: Math.max(0, ny) } : s));
                } else if (isPanning.current) {
                  setPan({ x: e.clientX - panStart.current.x, y: e.clientY - panStart.current.y });
                }
              }}
              onMouseUp={() => { isPanning.current = false; dragging.current = null; }}
              onMouseLeave={() => { isPanning.current = false; dragging.current = null; }}
              onClick={(e) => {
                const target = e.target as HTMLElement;
                if (target === canvasRef.current || target.closest("[data-canvas-bg]")) {
                  setSelectedId(null);
                  setAddMenuFor(null);
                }
              }}
            >
              <div data-canvas-bg="true" style={{ transform: `translate(${pan.x}px,${pan.y}px) scale(${zoom})`, transformOrigin: "0 0", width: canvasW, height: canvasH, position: "relative" }}>

                {/* SVG edges */}
                <svg style={{ position: "absolute", inset: 0, width: canvasW, height: canvasH, pointerEvents: "none", overflow: "visible" }}>
                  {steps.map((step) => {
                    const parent = steps.find((s) => s.id === step.parentId);
                    if (!parent) return null;
                    const x1 = parent.positionX + NODE_W;
                    const y1 = parent.positionY + NODE_H / 2;
                    const x2 = step.positionX;
                    const y2 = step.positionY + NODE_H / 2;
                    const cx = (x1 + x2) / 2;
                    const color = step.branch === "yes" ? "#10b981" : step.branch === "no" ? "#f43f5e" : "#94a3b8";
                    return (
                      <g key={step.id}>
                        <path d={`M${x1},${y1} C${cx},${y1} ${cx},${y2} ${x2},${y2}`}
                          fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
                        {/* Arrow head */}
                        <polygon points={`${x2},${y2} ${x2 - 8},${y2 - 4} ${x2 - 8},${y2 + 4}`} fill={color} />
                        {/* Branch label */}
                        {step.branch && (
                          <text x={(x1 + cx) / 2} y={y1 + (y2 - y1) * 0.3 - 6} textAnchor="middle"
                            fontSize="10" fontWeight="600" fill={color}>
                            {step.branch}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* Nodes */}
                {steps.map((step) => (
                  <FlowNode
                    key={step.id}
                    step={step}
                    selected={selectedId === step.id}
                    onSelect={() => { setSelectedId(step.id); setAddMenuFor(null); }}
                    onDragStart={(ox, oy) => { dragging.current = { id: step.id, ox, oy }; }}
                    onDelete={step.type !== "TRIGGER" ? () => deleteStep(step.id) : undefined}
                    onDuplicate={() => duplicateStep(step.id)}
                    onAddClick={(branch) => setAddMenuFor(addMenuFor?.parentId === step.id && addMenuFor.branch === branch ? null : { parentId: step.id, branch })}
                    addMenuOpen={addMenuFor?.parentId === step.id}
                    addMenuBranch={addMenuFor?.branch ?? null}
                    onAddStep={(branch, type) => addStep(step.id, branch, type)}
                    hasYesChild={steps.some((s) => s.parentId === step.id && s.branch === "yes")}
                    hasNoChild={steps.some((s) => s.parentId === step.id && s.branch === "no")}
                    hasLinearChild={steps.some((s) => s.parentId === step.id && s.branch === null)}
                  />
                ))}
              </div>

              {/* Zoom controls */}
              <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm z-10">
                <button onClick={() => setZoom((z) => Math.max(0.25, z - 0.1))} className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-lg text-lg">−</button>
                <span className="text-xs text-slate-500 w-10 text-center">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom((z) => Math.min(2, z + 0.1))} className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-lg text-lg">+</button>
                <button onClick={() => { setZoom(1); setPan({ x: 40, y: 0 }); }} className="w-7 h-7 flex items-center justify-center text-slate-400 hover:bg-slate-100 rounded-lg text-xs" title="Reset view">↺</button>
              </div>
            </div>

            {selectedStep && (
              <StepPanel step={selectedStep}
                onChange={(patch) => updateStep(selectedStep.id, patch)}
                onClose={() => setSelectedId(null)}
                onDelete={() => deleteStep(selectedStep.id)}
                onDuplicate={() => duplicateStep(selectedStep.id)}
              />
            )}
          </>
        )}
        {tab === "enrollments" && <EnrollmentsTab workflowId={initial.id} />}
        {tab === "stats"       && <StatsTab workflowId={initial.id} steps={steps} />}
        {tab === "versions"    && <VersionsTab workflowId={initial.id} />}
      </div>
    </div>
  );
}

// ─── FlowNode ─────────────────────────────────────────────────────────────────

const STEP_STYLES: Record<string, { bg: string; border: string; accent: string; icon: string }> = {
  TRIGGER:      { bg: "#eff6ff", border: "#93c5fd", accent: "#3b82f6", icon: "⚡" },
  SEND_EMAIL:   { bg: "#f0f9ff", border: "#7dd3fc", accent: "#0ea5e9", icon: "✉️" },
  WAIT:         { bg: "#fffbeb", border: "#fcd34d", accent: "#f59e0b", icon: "⏳" },
  IF_CONDITION: { bg: "#faf5ff", border: "#c4b5fd", accent: "#8b5cf6", icon: "⚡" },
  UPDATE_TAG:   { bg: "#f0fdf4", border: "#86efac", accent: "#22c55e", icon: "🏷️" },
  END:          { bg: "#fff1f2", border: "#fda4af", accent: "#f43f5e", icon: "⏹" },
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

function FlowNode({ step, selected, onSelect, onDragStart, onDelete, onDuplicate,
  onAddClick, addMenuOpen, addMenuBranch, onAddStep, hasYesChild, hasNoChild, hasLinearChild }: {
  step: WorkflowStep; selected: boolean;
  onSelect: () => void;
  onDragStart: (ox: number, oy: number) => void;
  onDelete?: () => void;
  onDuplicate: () => void;
  onAddClick: (branch: string | null) => void;
  addMenuOpen: boolean;
  addMenuBranch: string | null;
  onAddStep: (branch: string | null, type: StepType) => void;
  hasYesChild: boolean; hasNoChild: boolean; hasLinearChild: boolean;
}) {
  const style = STEP_STYLES[step.type] ?? STEP_STYLES.TRIGGER;
  const isBranching = step.type === "IF_CONDITION";
  const isEnd = step.type === "END";

  return (
    <div
      data-node="true"
      style={{
        position: "absolute",
        left: step.positionX,
        top: step.positionY,
        width: NODE_W,
        height: NODE_H,
        background: style.bg,
        border: `2px solid ${selected ? style.accent : style.border}`,
        borderRadius: 12,
        boxShadow: selected ? `0 0 0 3px ${style.accent}33` : "0 1px 4px rgba(0,0,0,0.08)",
        cursor: "pointer",
        transition: "box-shadow 0.15s, border-color 0.15s",
        userSelect: "none",
      }}
      onMouseDown={(e) => {
        // Don't start drag if clicking a button inside the node
        if ((e.target as HTMLElement).closest("button")) return;
        e.stopPropagation();
        onSelect();
        onDragStart(e.clientX - step.positionX, e.clientY - step.positionY);
      }}
    >
      {/* Node body */}
      <div style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: 10, height: "100%" }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: style.accent + "22", border: `1.5px solid ${style.accent}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
          {style.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: style.accent }}>{STEP_LABELS[step.type]}</div>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{stepSummary(step)}</div>
          {step.notes && <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>📝 {step.notes}</div>}
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 2, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
          <button onClick={onDuplicate} title="Duplicate"
            style={{ width: 20, height: 20, borderRadius: 4, border: "1px solid #e2e8f0", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#94a3b8" }}>
            ⧉
          </button>
          {onDelete && (
            <button onClick={onDelete} title="Delete"
              style={{ width: 20, height: 20, borderRadius: 4, border: "1px solid #fecaca", background: "#fff1f2", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#f43f5e" }}>
              ×
            </button>
          )}
        </div>
      </div>

      {/* Output connectors — rendered outside node flow so overflow is visible */}
      {!isEnd && (
        <div
          data-node="true"
          style={{ position: "absolute", right: -16, top: "50%", transform: "translateY(-50%)", zIndex: 20 }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          {isBranching ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              {!hasYesChild && (
                <div style={{ position: "relative" }}>
                  <button
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); onAddClick("yes"); }}
                    style={{ width: 24, height: 24, borderRadius: "50%", background: "#10b981", border: "2.5px solid white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 16, fontWeight: 700, boxShadow: "0 2px 6px rgba(16,185,129,0.4)", lineHeight: 1 }}>
                    +
                  </button>
                  {addMenuOpen && addMenuBranch === "yes" && <AddMenu onAdd={(t) => onAddStep("yes", t)} />}
                </div>
              )}
              {!hasNoChild && (
                <div style={{ position: "relative" }}>
                  <button
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); onAddClick("no"); }}
                    style={{ width: 24, height: 24, borderRadius: "50%", background: "#f43f5e", border: "2.5px solid white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 16, fontWeight: 700, boxShadow: "0 2px 6px rgba(244,63,94,0.4)", lineHeight: 1 }}>
                    +
                  </button>
                  {addMenuOpen && addMenuBranch === "no" && <AddMenu onAdd={(t) => onAddStep("no", t)} />}
                </div>
              )}
            </div>
          ) : (
            !hasLinearChild && (
              <div style={{ position: "relative" }}>
                <button
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => { e.stopPropagation(); onAddClick(null); }}
                  style={{ width: 24, height: 24, borderRadius: "50%", background: "#6366f1", border: "2.5px solid white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 16, fontWeight: 700, boxShadow: "0 2px 6px rgba(99,102,241,0.4)", lineHeight: 1 }}>
                  +
                </button>
                {addMenuOpen && addMenuBranch === null && <AddMenu onAdd={(t) => onAddStep(null, t)} />}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

function AddMenu({ onAdd }: { onAdd: (type: StepType) => void }) {
  return (
    <div style={{ position: "absolute", left: 28, top: "50%", transform: "translateY(-50%)", background: "white", border: "1px solid #e2e8f0", borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", padding: 6, width: 160, zIndex: 50 }}>
      {STEP_TYPES.map((st) => (
        <button key={st.type} onClick={() => onAdd(st.type)}
          style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", fontSize: 12, color: "#374151", textAlign: "left" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
          <span>{st.icon}</span><span>{st.label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Enrollments Tab ──────────────────────────────────────────────────────────

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
    ACTIVE: "text-sky-600 bg-sky-50 border-sky-200", COMPLETED: "text-emerald-600 bg-emerald-50 border-emerald-200",
    FAILED: "text-rose-600 bg-rose-50 border-rose-200", PAUSED: "text-amber-600 bg-amber-50 border-amber-200",
  };

  return (
    <div className="flex-1 overflow-auto p-6 space-y-4">
      <div className="flex items-center gap-2">
        {["ALL","ACTIVE","COMPLETED","FAILED","PAUSED"].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${filter === s ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"}`}>{s}</button>
        ))}
      </div>
      {loading ? <div className="text-sm text-slate-400 py-8 text-center">Loading...</div>
        : enrollments.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center">
            <p className="text-slate-500 font-medium">No enrollments yet</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100 bg-slate-50">
                {["Contact","Status","Last Event","Enrolled","Updated"].map((h, i) => (
                  <th key={h} className={`px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider ${i === 0 ? "text-left" : "text-right"}`}>{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {enrollments.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50">
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
  useEffect(() => { fetch(`/api/workflows/${workflowId}/stats`).then((r) => r.json()).then(setData).finally(() => setLoading(false)); }, [workflowId]);
  if (loading) return <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">Loading stats...</div>;
  if (!data) return null;
  const STEP_LABELS: Record<string, string> = { TRIGGER: "Trigger", SEND_EMAIL: "Send Email", WAIT: "Wait", IF_CONDITION: "If Condition", UPDATE_TAG: "Update Tag", END: "End" };
  return (
    <div className="flex-1 overflow-auto p-6 space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[{ label: "Total Enrolled", value: data.total, color: "text-slate-800" }, { label: "Active", value: data.active, color: "text-sky-600" }, { label: "Completed", value: data.completed, color: "text-emerald-600" }, { label: "Failed", value: data.failed, color: "text-rose-500" }].map((s) => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl px-4 py-3.5"><div className={`text-2xl font-bold ${s.color}`}>{s.value}</div><div className="text-xs text-slate-400 mt-0.5">{s.label}</div></div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[{ label: "Completion Rate", value: `${data.completionRate}%`, color: "text-violet-600" }, { label: "Email Open Rate", value: `${data.openRate}%`, color: "text-indigo-600" }, { label: "Click Rate", value: `${data.clickRate}%`, color: "text-sky-600" }].map((s) => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl px-4 py-3.5"><div className={`text-2xl font-bold ${s.color}`}>{s.value}</div><div className="text-xs text-slate-400 mt-0.5">{s.label}</div></div>
        ))}
      </div>
      {data.stepFunnel.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Step Funnel</p>
          {data.stepFunnel.map((sf) => {
            const step = steps.find((s) => s.id === sf.stepId);
            const pct = data.total > 0 ? Math.round((sf.reached / data.total) * 100) : 0;
            return (
              <div key={sf.stepId} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">{STEP_LABELS[sf.stepType]}{step?.config?.subject ? ` — ${step.config.subject as string}` : ""}</span>
                  <span className="text-slate-400">{sf.reached} ({pct}%)</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} /></div>
              </div>
            );
          })}
        </div>
      )}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Activity Log</p>
        {data.activity.length === 0 ? <p className="text-sm text-slate-400">No activity yet.</p> : (
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
  useEffect(() => { fetch(`/api/workflows/${workflowId}/versions`).then((r) => r.json()).then(setVersions).finally(() => setLoading(false)); }, [workflowId]);

  async function restore(versionId: string) {
    if (!confirm("Restore this version? Current steps will be replaced.")) return;
    setRestoring(versionId);
    await fetch(`/api/workflows/${workflowId}/versions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ versionId }) });
    setRestoring(null); window.location.reload();
  }

  return (
    <div className="flex-1 overflow-auto p-6 space-y-4">
      <p className="text-xs text-slate-400">Up to 10 versions are saved automatically each time you save.</p>
      {loading ? <div className="text-sm text-slate-400 py-8 text-center">Loading...</div>
        : versions.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center">
            <p className="text-slate-500 font-medium">No versions saved yet</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            {versions.map((v, i) => (
              <div key={v.id} className={`flex items-center gap-4 px-5 py-3.5 ${i < versions.length - 1 ? "border-b border-slate-100" : ""}`}>
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">v{v.version}</div>
                <div className="flex-1"><div className="text-sm font-medium text-slate-700">Version {v.version}</div><div className="text-xs text-slate-400">{new Date(v.savedAt).toLocaleString()}</div></div>
                {i === 0 && <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">Latest</span>}
                <button onClick={() => restore(v.id)} disabled={restoring === v.id} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-50 transition-colors">
                  {restoring === v.id ? "Restoring..." : "Restore"}
                </button>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
