"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function AuthLeftPanel() {
  return (
    <div className="hidden lg:flex w-[60%] flex-col justify-between p-12 relative overflow-hidden bg-[#0d0d18]">
      {/* Background gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/15 rounded-full blur-[100px]" />
        <div className="absolute top-1/3 left-1/3 w-[250px] h-[250px] bg-sky-500/8 rounded-full blur-[80px]" />
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
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-3.5 py-1.5 text-xs font-medium text-violet-400">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Free forever · No credit card
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight tracking-tight">
            Start sending<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
              smarter today.
            </span>
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
            Join builders who use ReachX to understand their email systems from the inside out.
          </p>
        </div>

        {/* Feature list with icons */}
        <div className="space-y-3">
          {[
            { icon: "✉️", title: "Campaign Engine", desc: "Create, send, and track email campaigns" },
            { icon: "🔍", title: "Email Validation", desc: "SMTP-level checks before you send" },
            { icon: "📊", title: "Smart Analytics", desc: "Opens, clicks, bounces — all in one place" },
            { icon: "⚡", title: "Background Queue", desc: "Reliable delivery with Redis + BullMQ" },
          ].map((f) => (
            <div key={f.title} className="flex items-center gap-3 bg-white/[0.04] border border-white/8 rounded-xl px-4 py-3">
              <span className="text-lg shrink-0">{f.icon}</span>
              <div>
                <div className="text-xs font-semibold text-white">{f.title}</div>
                <div className="text-xs text-slate-500 mt-0.5">{f.desc}</div>
              </div>
              <div className="ml-auto">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-700">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Social proof strip */}
        <div className="flex items-center gap-4 pt-2 border-t border-white/5">
          <div className="flex -space-x-2">
            {["#6366f1", "#8b5cf6", "#06b6d4", "#10b981"].map((c, i) => (
              <div key={i} className="w-7 h-7 rounded-full border-2 border-[#0d0d18] flex items-center justify-center text-[10px] font-bold text-white" style={{ background: c }}>
                {["A", "B", "C", "D"][i]}
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500">
            Trusted by <span className="text-slate-300 font-medium">500+</span> builders
          </p>
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

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Something went wrong"); setLoading(false); }
    else router.push("/login?registered=1");
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
            <h1 className="text-2xl font-bold text-white tracking-tight">Create your account</h1>
            <p className="text-slate-500 text-sm mt-1">Free forever. No credit card needed.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Name</label>
              <input
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>
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
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
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
              {loading ? "Creating account..." : "Create account →"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Sign in</Link>
          </p>
          <div className="text-center">
            <Link href="/" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">← Back to home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
