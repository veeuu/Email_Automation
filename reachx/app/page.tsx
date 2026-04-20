"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";

type Result = { status: "VALID" | "RISKY" | "INVALID"; reason: string } | null;

const STATUS_CONFIG = {
  VALID: { color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", dot: "bg-emerald-500", label: "Deliverable" },
  RISKY: { color: "text-amber-700", bg: "bg-amber-50 border-amber-200", dot: "bg-amber-500", label: "Risky" },
  INVALID: { color: "text-rose-700", bg: "bg-rose-50 border-rose-200", dot: "bg-rose-500", label: "Undeliverable" },
};

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<Result>(null);
  const [loading, setLoading] = useState(false);

  async function handleValidate() {
    if (!email.trim()) return;
    setLoading(true);
    setResult(null);
    const res = await fetch("/api/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emails: [email.trim()] }),
    });
    const data = await res.json();
    setResult(data.results?.[0] ?? null);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm shadow-indigo-200">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
            <span className="font-semibold text-slate-900 text-sm">ReachX</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
            <Link href="/validate" className="hover:text-slate-900 transition-colors">Validator</Link>
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium">Log in</Link>
            <Link href="/register">
              <button className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg font-medium shadow-sm shadow-indigo-200 transition-all">
                Get started
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Left */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-3.5 py-1.5 text-xs font-medium text-indigo-700">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              Email intelligence for builders
            </div>

            <div className="space-y-4">
              <h1 className="text-6xl font-bold leading-[1.05] tracking-tight text-slate-900">
                Send smarter.<br />
                <span className="text-indigo-600">Understand</span> every<br />
                email you send.
              </h1>
              <p className="text-lg text-slate-500 leading-relaxed max-w-md">
                ReachX combines real email campaigns with full system visibility — so you can send, track, and actually learn how email works.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/register">
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-0.5">
                  Start for free →
                </button>
              </Link>
              <Link href="/validate" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1.5">
                Try email validator
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </Link>
            </div>

            <div className="flex items-center gap-8 pt-4 border-t border-slate-100">
              {[{ v: "99.9%", l: "Accuracy" }, { v: "< 10s", l: "Verify time" }, { v: "Free", l: "To start" }].map((s) => (
                <div key={s.l}>
                  <div className="text-xl font-bold text-slate-900">{s.v}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — validator widget */}
          <div className="relative">
            {/* Glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-3xl blur-2xl opacity-60" />
            <div className="relative bg-white border border-slate-200 rounded-2xl p-8 shadow-xl shadow-slate-200/50 space-y-6">
              {/* Window chrome */}
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="ml-3 text-xs text-slate-400 font-mono">email-verifier.reachx.app</span>
              </div>

              <div>
                <p className="font-semibold text-slate-900">Verify an email instantly</p>
                <p className="text-sm text-slate-500 mt-1">No signup needed. Paste and verify.</p>
              </div>

              <div className="space-y-3">
                <Input
                  className="bg-slate-50 border-slate-200 rounded-xl h-12 text-slate-900 placeholder:text-slate-400 focus-visible:ring-indigo-500 focus-visible:border-indigo-400"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleValidate()}
                />
                <button
                  onClick={handleValidate}
                  disabled={loading || !email.trim()}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl py-3 font-semibold shadow-lg shadow-indigo-500/25 transition-all"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                      Verifying...
                    </span>
                  ) : "Verify Email →"}
                </button>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-400">Try:</span>
                {["test@gmail.com", "fake@notreal.xyz", "info@mailinator.com"].map((ex) => (
                  <button key={ex} onClick={() => setEmail(ex)}
                    className="text-xs text-slate-500 hover:text-indigo-600 font-mono border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 rounded-md px-2 py-1 transition-all">
                    {ex}
                  </button>
                ))}
              </div>

              {result && (() => {
                const cfg = STATUS_CONFIG[result.status];
                return (
                  <div className={`rounded-xl border p-4 space-y-2.5 ${cfg.bg}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Result</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                        <span className={`font-bold text-sm ${cfg.color}`}>{cfg.label}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Detail</span>
                      <span className="text-sm text-slate-700">{result.reason}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Email</span>
                      <span className="text-sm font-mono text-slate-700">{email}</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-4xl font-bold text-slate-900 tracking-tight">Built different</h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">Most tools just send emails. ReachX shows you what's happening at every step.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: "✉️", title: "Campaign Engine", desc: "Create campaigns, upload contacts, send via Brevo. Full delivery pipeline with bounce handling and retry logic.", tag: "Core" },
              { icon: "🔍", title: "Visibility Layer", desc: "See what happens inside every send — SMTP flow, spam scoring, authentication checks. No black boxes.", tag: "Unique" },
              { icon: "📊", title: "Smart Analytics", desc: "Track opens, clicks, and engagement. Understand why results happen, not just what they are.", tag: "Insights" },
            ].map((f) => (
              <div key={f.title} className="bg-white border border-slate-200 rounded-2xl p-7 space-y-4 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-0.5 transition-all duration-200">
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{f.icon}</span>
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full">{f.tag}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-lg">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-4xl font-bold text-slate-900 tracking-tight">Ready to send smarter?</h2>
          <p className="text-slate-500 text-lg">Join builders who use ReachX to understand their email systems.</p>
          <Link href="/register">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-xl shadow-indigo-500/25 transition-all hover:-translate-y-0.5">
              Get started for free →
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-indigo-600 flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
            <span className="font-medium text-slate-600">ReachX</span>
          </div>
          <span>© 2026 · Built for builders</span>
        </div>
      </footer>
    </div>
  );
}
