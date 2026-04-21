"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { useSession } from "next-auth/react";

type ValidationResult = {
  email: string;
  status: "VALID" | "RISKY" | "INVALID";
  reason: string;
};

const STATUS_CONFIG = {
  VALID:   { label: "Deliverable",   dot: "bg-emerald-400", text: "text-emerald-400", ring: "border-emerald-500/30 bg-emerald-500/10" },
  RISKY:   { label: "Risky",         dot: "bg-amber-400",   text: "text-amber-400",   ring: "border-amber-500/30 bg-amber-500/10" },
  INVALID: { label: "Undeliverable", dot: "bg-rose-400",    text: "text-rose-400",    ring: "border-rose-500/30 bg-rose-500/10" },
};

export default function ValidateDashboardPage() {
  const { data: session } = useSession();
  const [input, setInput] = useState("");
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [loading, setLoading] = useState(false);

  const parsedEmails = input.split(/[\n,]+/).map((e) => e.trim()).filter(Boolean);

  async function handleValidate() {
    if (!parsedEmails.length) return;
    setLoading(true);
    const res = await fetch("/api/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emails: parsedEmails }),
    });
    const data = await res.json();
    setResults(data.results ?? []);
    setLoading(false);
  }

  const counts = results.reduce((acc, r) => ({ ...acc, [r.status]: (acc[r.status] ?? 0) + 1 }), {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      <Sidebar email={session?.user?.email ?? ""} />
      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-8 py-10 space-y-8">

          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Email Validation</h1>
            <p className="text-slate-500 text-sm mt-1">Paste emails below — each one is checked for format, MX records, and mailbox existence.</p>
          </div>

          {/* Input card */}
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Email addresses</label>
              <p className="text-xs text-slate-600">One per line or comma-separated</p>
              <textarea
                rows={7}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={"john@example.com\njane@company.com\ntest@mailinator.com"}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-slate-200 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 resize-none"
              />
              {parsedEmails.length > 0 && (
                <p className="text-xs font-medium text-indigo-400">{parsedEmails.length} email{parsedEmails.length !== 1 ? "s" : ""} detected</p>
              )}
            </div>
            <button
              onClick={handleValidate}
              disabled={loading || !parsedEmails.length}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-900/40 transition-all flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Validating...
                </>
              ) : "Validate Emails →"}
            </button>
          </div>

          {/* Results */}
          {results.length > 0 && (
            <>
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                {(["VALID", "RISKY", "INVALID"] as const).map((s) => {
                  const cfg = STATUS_CONFIG[s];
                  return (
                    <div key={s} className={`border rounded-2xl p-5 ${cfg.ring}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                        <span className={`text-xs font-semibold uppercase tracking-wider ${cfg.text}`}>{cfg.label}</span>
                      </div>
                      <div className={`text-3xl font-bold ${cfg.text}`}>{counts[s] ?? 0}</div>
                      <div className="text-xs text-slate-600 mt-1">
                        {results.length > 0 ? (((counts[s] ?? 0) / results.length) * 100).toFixed(0) + "%" : "0%"} of total
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Table */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5">
                  <h2 className="text-sm font-semibold text-slate-300">{results.length} results</h2>
                </div>
                <div className="divide-y divide-white/[0.04]">
                  {results.map((r) => {
                    const cfg = STATUS_CONFIG[r.status];
                    return (
                      <div key={r.email} className="flex items-center justify-between px-6 py-3.5 hover:bg-white/[0.02] transition-colors">
                        <span className="font-mono text-sm text-slate-300">{r.email}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-slate-500">{r.reason}</span>
                          <div className={`flex items-center gap-1.5 border rounded-full px-3 py-1 ${cfg.ring}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                            <span className={`text-xs font-semibold ${cfg.text}`}>{cfg.label}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
}
