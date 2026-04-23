"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputCls = "w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all";

export function EditPanel({
  campaignId, name, subject, content, fromName, replyTo,
}: {
  campaignId: string; name: string; subject: string; content: string;
  fromName?: string | null; replyTo?: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name, subject, content, fromName: fromName ?? "", replyTo: replyTo ?? "" });
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    await fetch(`/api/campaigns/${campaignId}/edit`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    router.refresh();
    setOpen(false);
    setLoading(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-800 border border-slate-200 hover:bg-slate-50 transition-all"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
        Edit
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-2xl w-full space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Edit Campaign</h2>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Campaign name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Subject line</label>
              <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className={inputCls} />
            </div>

            {/* Sender settings */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sender settings</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">From name</label>
                  <input
                    value={form.fromName}
                    onChange={(e) => setForm({ ...form, fromName: e.target.value })}
                    placeholder={process.env.NEXT_PUBLIC_DEFAULT_FROM_NAME ?? "ReachX"}
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Reply-to email</label>
                  <input
                    type="email"
                    value={form.replyTo}
                    onChange={(e) => setForm({ ...form, replyTo: e.target.value })}
                    placeholder="replies@yourdomain.com"
                    className={inputCls}
                  />
                </div>
              </div>
              <p className="text-xs text-slate-400">Leave blank to use the account default sender.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Email content</label>
              <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={10} className={`${inputCls} font-mono resize-none`} />
            </div>

            <div className="flex gap-2 pt-1">
              <button onClick={handleSave} disabled={loading} className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold transition-all">
                {loading ? "Saving..." : "Save changes"}
              </button>
              <button onClick={() => setOpen(false)} className="px-4 py-2.5 rounded-xl text-sm text-slate-500 hover:text-slate-800 border border-slate-200 hover:bg-slate-50 transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
