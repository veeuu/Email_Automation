"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import { useSession } from "next-auth/react";

const inputCls = "w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all";

const STEPS = [
  { n: 1, label: "Campaign Info" },
  { n: 2, label: "Email Content" },
  { n: 3, label: "Recipients" },
];

export default function NewCampaignPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [recipientInput, setRecipientInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const parsedEmails = recipientInput.split(/[\n,]+/).map((e) => e.trim()).filter(Boolean);
  const canNext = step === 1 ? (name.trim() && subject.trim()) : step === 2 ? content.trim() : parsedEmails.length > 0;

  async function handleSubmit() {
    if (!parsedEmails.length) { setError("Add at least one recipient"); return; }
    setLoading(true);
    setError("");
    const res = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, subject, content, recipients: parsedEmails }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Failed to create campaign"); setLoading(false); }
    else router.push(`/dashboard/campaigns/${data.id}`);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar email={session?.user?.email ?? ""} />
      <main className="flex-1 overflow-auto">

        {/* Step bar */}
        <div className="border-b border-slate-200 bg-white">
          <div className="max-w-3xl mx-auto px-8 flex items-center">
            {STEPS.map((s, i) => {
              const done   = step > s.n;
              const active = step === s.n;
              return (
                <div key={s.n} className="flex items-center">
                  <button
                    onClick={() => done && setStep(s.n)}
                    className={`flex items-center gap-2.5 px-5 py-4 text-sm font-medium transition-colors border-b-2 ${
                      active ? "text-indigo-700 border-indigo-500" : done ? "text-slate-500 border-transparent hover:text-slate-800 cursor-pointer" : "text-slate-400 border-transparent cursor-default"
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                      active ? "bg-indigo-600 text-white" : done ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-400"
                    }`}>
                      {done ? (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      ) : s.n}
                    </span>
                    {s.label}
                  </button>
                  {i < STEPS.length - 1 && <div className="w-8 h-px bg-slate-200 mx-1" />}
                </div>
              );
            })}
            <div className="ml-auto flex items-center gap-2 py-3">
              {step > 1 && (
                <button onClick={() => setStep(step - 1)} className="px-4 py-2 rounded-xl text-sm text-slate-500 hover:text-slate-800 border border-slate-200 hover:bg-slate-50 transition-all">
                  Previous
                </button>
              )}
              {step < 3 ? (
                <button onClick={() => canNext && setStep(step + 1)} disabled={!canNext} className="px-5 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all">
                  Next Step →
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={loading || !canNext} className="px-5 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all">
                  {loading ? "Creating..." : "Create Campaign →"}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-8 py-10 space-y-6">
          <Link href="/dashboard/campaigns" className="text-slate-400 hover:text-slate-700 transition-colors text-sm">
            ← Campaigns
          </Link>

          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Campaign Info</h1>
                <p className="text-slate-400 text-sm mt-1">Give your campaign a name and subject line.</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Campaign name</label>
                  <input placeholder="e.g. April Newsletter" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Subject line</label>
                  <input placeholder="e.g. Here's what's new this month" value={subject} onChange={(e) => setSubject(e.target.value)} className={inputCls} />
                  {subject && (
                    <p className="text-xs text-slate-400">{subject.length} characters · {subject.length <= 50 ? "Good length" : subject.length <= 70 ? "A bit long" : "Too long"}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Email Content</h1>
                <p className="text-slate-400 text-sm mt-1">Write your email body — HTML or plain text.</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <span className="text-xs text-slate-400 w-16 shrink-0">Subject:</span>
                  <span className="text-sm text-slate-700 font-medium">{subject}</span>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Email body</label>
                  <p className="text-xs text-slate-400">HTML or plain text</p>
                  <textarea
                    placeholder={"<p>Hello {{name}},</p>\n<p>Here's your update...</p>"}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={14}
                    className={`${inputCls} font-mono resize-none`}
                  />
                </div>
                {content && (
                  <div className="flex items-center gap-2 text-xs text-emerald-600">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Content saved
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Recipients</h1>
                <p className="text-slate-400 text-sm mt-1">Add the email addresses you want to send to.</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Email addresses</label>
                  <p className="text-xs text-slate-400">One per line or comma-separated</p>
                  <textarea
                    placeholder={"john@example.com\njane@company.com"}
                    value={recipientInput}
                    onChange={(e) => setRecipientInput(e.target.value)}
                    rows={8}
                    className={`${inputCls} font-mono resize-none`}
                  />
                </div>
                {parsedEmails.length > 0 && (
                  <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500 shrink-0">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                    </svg>
                    <span className="text-sm font-medium text-indigo-700">{parsedEmails.length} recipient{parsedEmails.length !== 1 ? "s" : ""} detected</span>
                  </div>
                )}
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Campaign summary</p>
                {[
                  { label: "Name",       value: name },
                  { label: "Subject",    value: subject },
                  { label: "Recipients", value: `${parsedEmails.length} address${parsedEmails.length !== 1 ? "es" : ""}` },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">{row.label}</span>
                    <span className="text-slate-700 font-medium truncate max-w-xs text-right">{row.value}</span>
                  </div>
                ))}
              </div>

              {error && (
                <p className="text-rose-600 text-sm bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">{error}</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
