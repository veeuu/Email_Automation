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
  VALID: { color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", dot: "bg-emerald-500", label: "Deliverable" },
  RISKY: { color: "text-amber-700", bg: "bg-amber-50 border-amber-200", dot: "bg-amber-500", label: "Risky" },
  INVALID: { color: "text-rose-700", bg: "bg-rose-50 border-rose-200", dot: "bg-rose-500", label: "Undeliverable" },
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
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar email={session?.user?.email ?? ""} />
      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-8 py-10 space-y-8">
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Email Validation</h1>
            <p className="text-slate-500">Paste emails below — each one is checked for format, MX records, and mailbox existence.</p>
          </div>

          {/* Input card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email addresses</label>
              <p className="text-xs text-slate-400">One per line or comma-separated</p>
              <textarea
                rows={7}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={"john@example.com\njane@company.com\ntest@mailinator.com"}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 resize-none"
              />
              {parsedEmails.length > 0 && (
                <p className="text-xs font-medium text-indigo-600">{parsedEmails.length} email{parsedEmails.length !== 1 ? "s" : ""} detected</p>
              )}
            </div>
            <button
              onClick={handleValidate}
              disabled={loading || !parsedEmails.length}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
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
                    <div key={s} className={`border rounded-2xl p-5 ${cfg.bg}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                        <span className={`text-xs font-semibold uppercase tracking-wider ${cfg.color}`}>{cfg.label}</span>
                      </div>
                      <div className={`text-3xl font-bold ${cfg.color}`}>{counts[s] ?? 0}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {results.length > 0 ? (((counts[s] ?? 0) / results.length) * 100).toFixed(0) + "%" : "0%"} of total
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Table */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h2 className="text-sm font-semibold text-slate-700">{results.length} results</h2>
                </div>
                <div className="divide-y divide-slate-100">
                  {results.map((r) => {
                    const cfg = STATUS_CONFIG[r.status];
                    return (
                      <div key={r.email} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/50 transition-colors">
                        <span className="font-mono text-sm text-slate-700">{r.email}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-slate-500">{r.reason}</span>
                          <div className={`flex items-center gap-1.5 border rounded-full px-3 py-1 ${cfg.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                            <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
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
