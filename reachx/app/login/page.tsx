"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function AuthLeftPanel() {
  return (
    <div className="hidden lg:flex w-[60%] flex-col justify-between p-12 relative overflow-hidden bg-[#0d0d18]">
      {/* Background gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-violet-600/15 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-500/8 rounded-full blur-[80px]" />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      {/* Logo */}
      <div className="relative flex items-center gap-2.5 z-10">
        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/60">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        </div>
        <span className="font-bold text-white text-xl tracking-tight">ReachX</span>
      </div>

      {/* Center content */}
      <div className="relative z-10 space-y-10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3.5 py-1.5 text-xs font-medium text-indigo-400">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Email intelligence platform
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight tracking-tight">
            Send smarter.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
              Understand every send.
            </span>
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
            Full campaign engine with real-time validation, delivery tracking, and deep analytics.
          </p>
        </div>

        {/* Floating UI cards */}
        <div className="space-y-3">
          {/* Campaign card */}
          <div className="bg-white/[0.05] border border-white/10 rounded-2xl p-4 backdrop-blur-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white">Campaign sent</div>
              <div className="text-xs text-slate-500 mt-0.5">April Newsletter · 2,400 recipients</div>
            </div>
            <div className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
              ✓ Delivered
            </div>
          </div>

          {/* Stats card */}
          <div className="bg-white/[0.05] border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
            <div className="text-xs font-semibold text-slate-400 mb-3">Campaign performance</div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Open rate", value: "42.8%", color: "text-violet-400" },
                { label: "Click rate", value: "18.3%", color: "text-indigo-400" },
                { label: "Bounced", value: "0.4%", color: "text-emerald-400" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-[10px] text-slate-600 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
            {/* Mini bar chart */}
            <div className="mt-3 flex items-end gap-1 h-8">
              {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 88].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-indigo-500/30"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          {/* Validation card */}
          <div className="bg-white/[0.05] border border-white/10 rounded-2xl p-4 backdrop-blur-sm flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <div className="flex-1 text-xs text-slate-400 font-mono">john@company.com</div>
            <div className="text-xs font-semibold text-emerald-400">Deliverable</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 flex items-center justify-between">
        <p className="text-slate-600 text-xs">© 2026 ReachX</p>
        <div className="flex items-center gap-1.5">
          {["#6366f1", "#8b5cf6", "#06b6d4"].map((c) => (
            <div key={c} className="w-2 h-2 rounded-full opacity-60" style={{ background: c }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) { setError("Invalid email or password"); setLoading(false); }
    else router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      <AuthLeftPanel />

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <span className="font-bold text-white text-lg">ReachX</span>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back</h1>
            <p className="text-slate-500 text-sm mt-1">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Email</label>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>
            {error && (
              <p className="text-rose-400 text-sm bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2.5">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl py-3 font-semibold shadow-lg shadow-indigo-900/40 transition-all"
            >
              {loading ? "Signing in..." : "Sign in →"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Create one</Link>
          </p>
          <div className="text-center">
            <Link href="/" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">← Back to home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
