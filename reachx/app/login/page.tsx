"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function AuthLeftPanel() {
  return (
    <div className="hidden lg:flex w-[55%] flex-col justify-between p-12 relative overflow-hidden bg-indigo-600">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-500/30 rounded-full blur-[100px]" />
      </div>
      <div className="absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      <div className="relative flex items-center gap-2.5 z-10">
        <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        </div>
        <span className="font-bold text-white text-xl tracking-tight">ReachX</span>
      </div>

      <div className="relative z-10 space-y-10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-3.5 py-1.5 text-xs font-medium text-white">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Email intelligence platform
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight tracking-tight">
            Send smarter.<br />
            Understand every send.
          </h2>
          <p className="text-indigo-100 text-sm leading-relaxed max-w-sm">
            Full campaign engine with real-time validation, delivery tracking, and deep analytics.
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white">Campaign sent</div>
              <div className="text-xs text-indigo-200 mt-0.5">April Newsletter · 2,400 recipients</div>
            </div>
            <div className="text-xs font-bold text-emerald-300 bg-emerald-400/20 border border-emerald-400/30 px-2.5 py-1 rounded-full">
              ✓ Delivered
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
            <div className="text-xs font-semibold text-indigo-200 mb-3">Campaign performance</div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Open rate",  value: "42.8%", color: "text-white" },
                { label: "Click rate", value: "18.3%", color: "text-white" },
                { label: "Bounced",    value: "0.4%",  color: "text-emerald-300" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-[10px] text-indigo-300 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-end gap-1 h-8">
              {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 88].map((h, i) => (
                <div key={i} className="flex-1 rounded-sm bg-white/25" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <p className="text-indigo-200 text-xs">© 2026 ReachX</p>
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

  const inputCls = "w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all";

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AuthLeftPanel />
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <span className="font-bold text-slate-900 text-lg">ReachX</span>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h1>
            <p className="text-slate-400 text-sm mt-1">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <input type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputCls} />
            </div>
            {error && (
              <p className="text-rose-600 text-sm bg-rose-50 border border-rose-200 rounded-xl px-3 py-2.5">{error}</p>
            )}
            <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl py-3 font-semibold shadow-sm transition-all">
              {loading ? "Signing in..." : "Sign in →"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors">Create one</Link>
          </p>
          <div className="text-center">
            <Link href="/" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">← Back to home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
