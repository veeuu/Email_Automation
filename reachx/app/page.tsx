"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";

type Result = {
  status: "VALID" | "RISKY" | "INVALID";
  reason: string;
} | null;

const STATUS_CONFIG = {
  VALID: {
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    dot: "bg-emerald-400",
    label: "Deliverable",
  },
  RISKY: {
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    dot: "bg-amber-400",
    label: "Risky",
  },
  INVALID: {
    color: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/20",
    dot: "bg-rose-400",
    label: "Undeliverable",
  },
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
    <div className="min-h-screen bg-[#080b14] text-white font-sans">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-500 flex items-center justify-center text-xs font-bold">R</div>
          <span className="text-lg font-semibold tracking-tight">ReachX</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
          <Link href="/validate" className="hover:text-white transition-colors">Validator</Link>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how" className="hover:text-white transition-colors">How it works</a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
            Log in
          </Link>
          <Link href="/login">
            <button className="text-sm bg-violet-600 hover:bg-violet-500 transition-colors px-4 py-2 rounded-lg font-medium">
              Get started
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-8 pt-24 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        {/* Left */}
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 text-sm text-violet-300">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Email intelligence platform for builders
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
            Send smarter.<br />
            <span className="text-violet-400">Understand</span> every<br />
            email you send.
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed max-w-lg">
            ReachX combines real email campaigns with full system visibility —
            so you can send, track, and actually learn how email works under the hood.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <button className="bg-violet-600 hover:bg-violet-500 transition-colors px-6 py-3 rounded-xl font-semibold text-sm">
                Start for free →
              </button>
            </Link>
            <Link href="/validate" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1">
              Try email validator
              <span className="text-gray-600">→</span>
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-8 pt-4 border-t border-white/5">
            {[
              { value: "99.9%", label: "Accuracy" },
              { value: "< 10s", label: "Verification time" },
              { value: "Free", label: "To get started" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-xl font-bold text-white">{s.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — validator widget */}
        <div className="bg-[#0e1120] border border-white/8 rounded-2xl p-8 space-y-6 shadow-2xl">
          {/* Widget header */}
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="ml-2 text-xs text-gray-500 font-mono">email-verifier.reachx</span>
          </div>

          <div>
            <p className="text-white font-semibold text-lg">Verify an email instantly</p>
            <p className="text-gray-500 text-sm mt-1">No signup needed. Just paste and verify.</p>
          </div>

          <div className="space-y-3">
            <Input
              className="bg-[#161929] border-white/10 text-white placeholder:text-gray-600 rounded-xl h-12 px-4 focus-visible:ring-violet-500/50 focus-visible:border-violet-500/50"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleValidate()}
            />
            <button
              onClick={handleValidate}
              disabled={loading || !email.trim()}
              className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-xl py-3 font-semibold text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Verifying...
                </span>
              ) : (
                "Verify Email →"
              )}
            </button>
          </div>

          {/* Try examples */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-600">Try:</span>
            {["test@gmail.com", "fake@notreal.xyz", "info@mailinator.com"].map((ex) => (
              <button
                key={ex}
                onClick={() => setEmail(ex)}
                className="text-xs text-gray-500 hover:text-violet-400 transition-colors font-mono border border-white/5 rounded px-2 py-0.5 hover:border-violet-500/30"
              >
                {ex}
              </button>
            ))}
          </div>

          {/* Result */}
          {result && (() => {
            const cfg = STATUS_CONFIG[result.status];
            return (
              <div className={`rounded-xl border p-4 space-y-3 ${cfg.bg}`}>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs uppercase tracking-wider">Result</span>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                    <span className={`font-bold text-sm ${cfg.color}`}>{cfg.label}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs uppercase tracking-wider">Detail</span>
                  <span className="text-gray-300 text-sm">{result.reason}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs uppercase tracking-wider">Email</span>
                  <span className="text-gray-300 text-sm font-mono">{email}</span>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-white/5 py-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold">Everything you need to run email right</h2>
            <p className="text-gray-500 mt-3 text-lg">Built for students and early builders who want to understand the system, not just use it.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: "✉️",
                title: "Campaign Engine",
                desc: "Create campaigns, upload contacts, send via Brevo. Full delivery pipeline with bounce handling.",
              },
              {
                icon: "🔍",
                title: "Visibility Layer",
                desc: "See what happens inside every send — SMTP flow, spam scoring, authentication checks.",
              },
              {
                icon: "📊",
                title: "Analytics + Learning",
                desc: "Track opens, clicks, and engagement. Understand why results happen, not just what they are.",
              },
            ].map((f) => (
              <div key={f.title} className="bg-[#0e1120] border border-white/8 rounded-2xl p-6 space-y-3 hover:border-violet-500/30 transition-colors">
                <div className="text-2xl">{f.icon}</div>
                <h3 className="font-semibold text-white">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between text-sm text-gray-600">
          <span>© 2026 ReachX</span>
          <span>Built for builders.</span>
        </div>
      </footer>
    </div>
  );
}
