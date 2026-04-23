"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { useSession } from "next-auth/react";
import Link from "next/link";

type Segment = { id: string; name: string; filterType: string; filterValue: string | null; createdAt: string };

const inputCls = "w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all";

export default function SegmentsPage() {
  const { data: session } = useSession();
  const [segments, setSegments] = useState<Segment[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", filterType: "tag", filterValue: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadSegments(); }, []);

  async function loadSegments() {
    const res = await fetch("/api/segments");
    const data = await res.json();
    setSegments(data);
  }

  async function handleAdd() {
    setLoading(true);
    await fetch("/api/segments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    setShowAdd(false);
    setForm({ name: "", filterType: "tag", filterValue: "" });
    loadSegments();
  }

  async function handleDelete(id: string) {
    await fetch("/api/segments", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setSegments(segments.filter((s) => s.id !== id));
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar email={session?.user?.email ?? ""} />
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-8 py-8 space-y-6">

          <div className="flex items-center justify-between pt-1">
            <div>
              <Link href="/dashboard/contacts" className="text-slate-400 hover:text-slate-700 text-sm transition-colors">
                ← Contacts
              </Link>
              <h1 className="text-xl font-bold text-slate-900 mt-2 tracking-tight">Segments</h1>
              <p className="text-slate-400 text-sm mt-1">Saved filters for targeting specific groups of contacts.</p>
            </div>
            <button onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New Segment
            </button>
          </div>

          {segments.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-16 text-center">
              <p className="text-slate-700 font-semibold mb-1">No segments yet</p>
              <p className="text-slate-400 text-sm mb-5">Create a segment to group contacts by tag, status, or date.</p>
              <button onClick={() => setShowAdd(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all">
                Create Segment
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {segments.map((seg) => (
                <div key={seg.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-sm transition-all group">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-slate-800">{seg.name}</h3>
                      <p className="text-xs text-slate-400 mt-1 capitalize">
                        {seg.filterType}{seg.filterValue ? `: ${seg.filterValue}` : ""}
                      </p>
                    </div>
                    <button onClick={() => handleDelete(seg.id)}
                      className="text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showAdd && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
              <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-900">New Segment</h2>
                  <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-700 transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
                <input placeholder="Segment name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Filter type</label>
                  <select value={form.filterType} onChange={(e) => setForm({ ...form, filterType: e.target.value })} className={inputCls}>
                    <option value="tag">Tag</option>
                    <option value="status">Status</option>
                    <option value="date">Added in last N days</option>
                  </select>
                </div>
                {form.filterType === "tag" && (
                  <input placeholder="Tag name (e.g. customer)" value={form.filterValue} onChange={(e) => setForm({ ...form, filterValue: e.target.value })} className={inputCls} />
                )}
                {form.filterType === "status" && (
                  <select value={form.filterValue} onChange={(e) => setForm({ ...form, filterValue: e.target.value })} className={inputCls}>
                    <option value="">Select status</option>
                    <option value="active">Active</option>
                    <option value="unsubscribed">Unsubscribed</option>
                    <option value="bounced">Bounced</option>
                  </select>
                )}
                {form.filterType === "date" && (
                  <input type="number" placeholder="Days (e.g. 30)" value={form.filterValue} onChange={(e) => setForm({ ...form, filterValue: e.target.value })} className={inputCls} />
                )}
                <div className="flex gap-2 pt-1">
                  <button onClick={handleAdd} disabled={loading || !form.name} className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold transition-all">
                    {loading ? "Creating..." : "Create Segment"}
                  </button>
                  <button onClick={() => setShowAdd(false)} className="px-4 py-2.5 rounded-xl text-sm text-slate-500 hover:text-slate-800 border border-slate-200 hover:bg-slate-50 transition-all">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
