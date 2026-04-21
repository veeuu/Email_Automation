"use client";

import Link from "next/link";
import { useState } from "react";

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-8 text-sm text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how" className="hover:text-white transition-colors">How it works</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors font-medium">
            Sign in
          </Link>
          <Link href="/register">
            <button className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-lg shadow-indigo-900/40">
              Get started free
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
}

// ─── Logo ─────────────────────────────────────────────────────────────────────
function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/50">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
      </div>
      <span className="font-bold text-white text-2xl tracking-tight">ReachX</span>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative pt-40 pb-32 px-6 overflow-hidden">
      {/* Background glow blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-20 left-1/4 w-[400px] h-[400px] bg-violet-600/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 text-xs font-medium text-indigo-400 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          Email intelligence for modern teams
        </div>

        {/* Headline */}
        <h1 className="text-6xl md:text-7xl font-bold leading-[1.05] tracking-tight text-white mb-6">
          Send smarter emails.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
            Understand every send.
          </span>
        </h1>

        <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
          ReachX gives you a full email campaign engine with real-time validation, delivery tracking, and deep analytics — so you always know what's happening inside your emails.
        </p>

        {/* CTAs */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/register">
            <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-7 py-3.5 rounded-xl font-semibold text-sm shadow-xl shadow-indigo-900/50 transition-all hover:-translate-y-0.5">
              Start for free →
            </button>
          </Link>
          <Link href="/validate">
            <button className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-7 py-3.5 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5">
              Try email validator
            </button>
          </Link>
        </div>

        {/* Stats row */}
        <div className="mt-20 grid grid-cols-3 gap-px max-w-xl mx-auto bg-white/5 rounded-2xl overflow-hidden border border-white/5">
          {[
            { v: "99.9%", l: "Validation accuracy" },
            { v: "< 5s", l: "Verify time" },
            { v: "Free", l: "To get started" },
          ].map((s) => (
            <div key={s.l} className="bg-[#0a0a0f] px-6 py-5 text-center">
              <div className="text-2xl font-bold text-white">{s.v}</div>
              <div className="text-xs text-slate-500 mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
    tag: "Core",
    title: "Campaign Engine",
    desc: "Create campaigns, upload contacts, and send via Brevo. Full delivery pipeline with bounce handling and automatic retry logic.",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10 border-indigo-500/20",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
    ),
    tag: "Unique",
    title: "Email Validation",
    desc: "Validate emails in bulk — format checks, MX record lookups, and mailbox existence. Know before you send.",
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
    tag: "Insights",
    title: "Smart Analytics",
    desc: "Track opens, clicks, bounces, and spam reports per campaign. Understand why results happen, not just what they are.",
    color: "text-sky-400",
    bg: "bg-sky-500/10 border-sky-500/20",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
      </svg>
    ),
    tag: "Management",
    title: "Contact Manager",
    desc: "Import contacts via CSV, tag and segment them, and manage your entire list from one clean interface.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    tag: "Reliability",
    title: "Background Queue",
    desc: "Emails are sent via BullMQ workers with Redis — non-blocking, with 3 retries and exponential backoff built in.",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    tag: "Security",
    title: "Auth & Sessions",
    desc: "Secure credential-based auth with NextAuth v5. Each user's campaigns and contacts are fully isolated.",
    color: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/20",
  },
];

function Features() {
  return (
    <section id="features" className="py-28 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">Features</p>
          <h2 className="text-4xl font-bold text-white tracking-tight">Everything you need to send at scale</h2>
          <p className="text-slate-400 mt-4 max-w-xl mx-auto">One platform for validation, sending, and understanding your email performance.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 rounded-2xl p-6 transition-all duration-200">
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl border ${f.bg} ${f.color} mb-4`}>
                {f.icon}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-white">{f.title}</h3>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${f.bg} ${f.color}`}>{f.tag}</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How it works ─────────────────────────────────────────────────────────────
const STEPS = [
  { n: "01", title: "Create your campaign", desc: "Set a name, subject line, and write your HTML email content in the editor." },
  { n: "02", title: "Add & validate contacts", desc: "Import a CSV or add contacts manually. Run bulk validation to filter bad addresses before sending." },
  { n: "03", title: "Send & track", desc: "Hit send — emails are queued and delivered via Brevo. Watch opens, clicks, and bounces roll in live." },
];

function HowItWorks() {
  return (
    <section id="how" className="py-28 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">How it works</p>
          <h2 className="text-4xl font-bold text-white tracking-tight">Up and running in minutes</h2>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Connector line */}
          <div className="hidden md:block absolute top-8 left-[calc(16.66%+1rem)] right-[calc(16.66%+1rem)] h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

          {STEPS.map((s) => (
            <div key={s.n} className="relative flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-lg z-10">
                {s.n}
              </div>
              <h3 className="font-semibold text-white text-lg">{s.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xs">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Social proof / highlight strip ──────────────────────────────────────────
function SocialProof() {
  return (
    <section className="py-20 px-6 border-t border-white/5 bg-white/[0.02]">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { v: "10k+", l: "Emails validated" },
            { v: "500+", l: "Campaigns sent" },
            { v: "99.9%", l: "Uptime" },
            { v: "< 5s", l: "Avg. verify time" },
          ].map((s) => (
            <div key={s.l}>
              <div className="text-4xl font-bold text-white mb-1">{s.v}</div>
              <div className="text-sm text-slate-500">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Validator demo widget ────────────────────────────────────────────────────
type ValidResult = { status: "VALID" | "RISKY" | "INVALID"; reason: string } | null;

const STATUS_CFG = {
  VALID:   { label: "Deliverable",   dot: "bg-emerald-400", text: "text-emerald-400", ring: "border-emerald-500/30 bg-emerald-500/10" },
  RISKY:   { label: "Risky",         dot: "bg-amber-400",   text: "text-amber-400",   ring: "border-amber-500/30 bg-amber-500/10" },
  INVALID: { label: "Undeliverable", dot: "bg-rose-400",    text: "text-rose-400",    ring: "border-rose-500/30 bg-rose-500/10" },
};

function ValidatorWidget() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<ValidResult>(null);
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
    <section id="pricing" className="py-28 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left copy */}
          <div className="space-y-6">
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Live demo</p>
            <h2 className="text-4xl font-bold text-white tracking-tight leading-tight">
              Verify any email<br />right now — free.
            </h2>
            <p className="text-slate-400 leading-relaxed">
              No signup needed. Paste an email address and see exactly what ReachX checks: format, MX records, and mailbox existence.
            </p>
            <ul className="space-y-3">
              {["Format & syntax validation", "MX record lookup", "Mailbox existence check", "Disposable email detection"].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Right widget */}
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-8 space-y-5 shadow-2xl shadow-black/40">
            {/* Window chrome */}
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500/70" />
              <div className="w-3 h-3 rounded-full bg-amber-500/70" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
              <span className="ml-3 text-xs text-slate-500 font-mono">reachx — email validator</span>
            </div>

            <div>
              <p className="text-white font-semibold">Verify an email instantly</p>
              <p className="text-sm text-slate-500 mt-1">Paste any address and hit verify.</p>
            </div>

            <div className="flex gap-2">
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleValidate()}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:bg-white/8 transition-all"
              />
              <button
                onClick={handleValidate}
                disabled={loading || !email.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap"
              >
                {loading ? (
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                ) : "Verify →"}
              </button>
            </div>

            {/* Quick examples */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-600">Try:</span>
              {["test@gmail.com", "fake@notreal.xyz", "info@mailinator.com"].map((ex) => (
                <button key={ex} onClick={() => setEmail(ex)}
                  className="text-xs text-slate-500 hover:text-indigo-400 font-mono border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/10 rounded-md px-2 py-1 transition-all">
                  {ex}
                </button>
              ))}
            </div>

            {/* Result */}
            {result && (() => {
              const cfg = STATUS_CFG[result.status];
              return (
                <div className={`rounded-xl border p-4 space-y-3 ${cfg.ring}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Result</span>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                      <span className={`font-bold text-sm ${cfg.text}`}>{cfg.label}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Email</span>
                    <span className="font-mono text-slate-300">{email}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Detail</span>
                    <span className="text-slate-300">{result.reason}</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── CTA Banner ───────────────────────────────────────────────────────────────
function CTABanner() {
  return (
    <section className="py-28 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-600/20 to-violet-600/20 border border-indigo-500/20 p-16 text-center">
          {/* Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-violet-600/10 to-indigo-600/10 pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative space-y-6">
            <h2 className="text-5xl font-bold text-white tracking-tight">
              Ready to send smarter?
            </h2>
            <p className="text-slate-400 text-lg max-w-lg mx-auto">
              Join builders who use ReachX to understand their email systems from the inside out.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap pt-2">
              <Link href="/register">
                <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl font-semibold text-base shadow-xl shadow-indigo-900/50 transition-all hover:-translate-y-0.5">
                  Get started for free →
                </button>
              </Link>
              <Link href="/login">
                <button className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-xl font-semibold text-base transition-all hover:-translate-y-0.5">
                  Sign in
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-white/5 py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
        <Logo />
        <div className="flex items-center gap-6">
          <Link href="/validate" className="hover:text-slate-300 transition-colors">Validator</Link>
          <Link href="/login" className="hover:text-slate-300 transition-colors">Sign in</Link>
          <Link href="/register" className="hover:text-slate-300 transition-colors">Register</Link>
        </div>
        <span>© 2026 ReachX · Built for builders</span>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Navbar />
      <Hero />
      <SocialProof />
      <Features />
      <HowItWorks />
      <ValidatorWidget />
      <CTABanner />
      <Footer />
    </div>
  );
}
