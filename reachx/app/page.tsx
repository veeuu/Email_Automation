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
    color: "text-green-700",
    bg: "bg-green-50 border-green-200",
    dot: "bg-green-500",
    label: "Deliverable",
  },
  RISKY: {
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
    dot: "bg-amber-500",
    label: "Risky",
  },
  INVALID: {
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
    dot: "bg-red-500",
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Nav */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-lg">
              R
            </div>
            <span className="text-xl font-bold text-gray-900">ReachX</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <Link href="/validate" className="hover:text-gray-900 transition-colors">Validator</Link>
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#how" className="hover:text-gray-900 transition-colors">How it works</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Log in
            </Link>
            <Link href="/login">
              <button className="text-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-5 py-2 rounded-xl font-medium shadow-lg shadow-blue-500/25 transition-all">
                Get started
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-8 pt-20 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left */}
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 bg-blue-100 border border-blue-200 rounded-full px-4 py-2 text-sm text-blue-700">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Email intelligence platform for builders
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-gray-900">
            Send smarter.<br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Understand
            </span>{" "}
            every<br />
            email you send.
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed max-w-lg">
            ReachX combines real email campaigns with full system visibility —
            so you can send, track, and actually learn how email works under the hood.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all">
                Start for free →
              </button>
            </Link>
            <Link href="/validate" className="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1">
              Try email validator
              <span className="text-gray-400">→</span>
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-8 pt-6 border-t border-gray-200">
            {[
              { value: "99.9%", label: "Accuracy" },
              { value: "< 10s", label: "Verification time" },
              { value: "Free", label: "To get started" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                <div className="text-xs text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — validator widget */}
        <div className="bg-white border border-gray-200 rounded-3xl p-8 space-y-6 shadow-2xl shadow-gray-900/10">
          <div>
            <p className="text-gray-900 font-semibold text-lg">Verify an email instantly</p>
            <p className="text-gray-500 text-sm mt-1">No signup needed. Just paste and verify.</p>
          </div>

          <div className="space-y-3">
            <Input
              className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-blue-500 focus-visible:border-blue-500"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleValidate()}
            />
            <button
              onClick={handleValidate}
              disabled={loading || !email.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl py-3 font-semibold shadow-lg shadow-blue-500/25 transition-all"
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
            <span className="text-xs text-gray-500">Try:</span>
            {["test@gmail.com", "fake@notreal.xyz", "info@mailinator.com"].map((ex) => (
              <button
                key={ex}
                onClick={() => setEmail(ex)}
                className="text-xs text-gray-600 hover:text-blue-600 transition-colors font-mono border border-gray-200 rounded-lg px-2 py-1 hover:border-blue-300 hover:bg-blue-50"
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
                  <span className="text-gray-600 text-xs uppercase tracking-wider font-medium">Result</span>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                    <span className={`font-bold text-sm ${cfg.color}`}>{cfg.label}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-xs uppercase tracking-wider font-medium">Detail</span>
                  <span className="text-gray-700 text-sm">{result.reason}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-xs uppercase tracking-wider font-medium">Email</span>
                  <span className="text-gray-700 text-sm font-mono">{email}</span>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-gray-200 bg-white py-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900">Everything you need to run email right</h2>
            <p className="text-gray-600 mt-3 text-lg">Built for students and early builders who want to understand the system, not just use it.</p>
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
              <div key={f.title} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6 space-y-3 hover:border-blue-300 hover:shadow-lg transition-all">
                <div className="text-3xl">{f.icon}</div>
                <h3 className="font-semibold text-gray-900">{f.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between text-sm text-gray-500">
          <span>© 2026 ReachX</span>
          <span>Built for builders.</span>
        </div>
      </footer>
    </div>
  );
}
