"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import { useSession } from "next-auth/react";

const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all";

export default function NewCampaignPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [recipientInput, setRecipientInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const parsedEmails = recipientInput.split(/[\n,]+/).map((e) => e.trim()).filter(Boolean);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
    <div className="min-h-screen bg-[#0a0a0f] flex">
      <Sidebar email={session?.user?.email ?? ""} />
      <main className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto px-8 py-10 space-y-8">

          <div className="flex items-center gap-3">
            <Link href="/dashboard/campaigns" className="text-slate-500 hover:text-slate-300 transition-colors text-sm">
              ← Campaigns
            </Link>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">New Campaign</h1>
            <p className="text-slate-500 text-sm mt-1">Fill in the details and add your recipients.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Campaign details */}
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 space-y-5">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Campaign details</h2>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Campaign name</label>
                <input
                  placeholder="e.g. April Newsletter"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className={inputCls}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Subject line</label>
                <input
                  placeholder="e.g. Here's what's new this month"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className={inputCls}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Email content (HTML or plain text)</label>
                <textarea
                  placeholder="<p>Hello! Here's your update...</p>"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={8}
                  className={`${inputCls} font-mono resize-none`}
                />
              </div>
            </div>

            {/* Recipients */}
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 space-y-4">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Recipients</h2>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Email addresses</label>
                <p className="text-xs text-slate-600">One per line or comma-separated</p>
                <textarea
                  placeholder={"john@example.com\njane@company.com"}
                  value={recipientInput}
                  onChange={(e) => setRecipientInput(e.target.value)}
                  rows={5}
                  className={`${inputCls} font-mono resize-none`}
                />
                {parsedEmails.length > 0 && (
                  <p className="text-xs font-medium text-indigo-400">{parsedEmails.length} recipient{parsedEmails.length !== 1 ? "s" : ""} detected</p>
                )}
              </div>
            </div>

            {error && (
              <p className="text-rose-400 text-sm bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2.5">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-900/40 transition-all"
              >
                {loading ? "Creating..." : "Create Campaign →"}
              </button>
              <Link href="/dashboard/campaigns">
                <button type="button" className="px-6 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white border border-white/10 hover:bg-white/5 transition-all">
                  Cancel
                </button>
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
