"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function NewCampaignPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [recipientInput, setRecipientInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const parsedEmails = recipientInput
    .split(/[\n,]+/)
    .map((e) => e.trim())
    .filter(Boolean);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!parsedEmails.length) {
      setError("Add at least one recipient");
      return;
    }
    setLoading(true);
    setError("");

    const res = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, subject, content, recipients: parsedEmails }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to create campaign");
      setLoading(false);
    } else {
      router.push(`/dashboard/campaigns/${data.id}`);
    }
  }

  return (
    <div className="min-h-screen bg-[#080b14] text-white p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/campaigns" className="text-gray-500 hover:text-white transition-colors text-sm">
            ← Campaigns
          </Link>
        </div>

        <div>
          <h1 className="text-2xl font-bold">New Campaign</h1>
          <p className="text-gray-500 text-sm mt-1">Fill in the details and add your recipients.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-[#0e1120] border border-white/8 rounded-2xl p-6 space-y-5">
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Campaign details</h2>

            <div className="space-y-1.5">
              <label className="text-sm text-gray-400">Campaign name</label>
              <Input
                placeholder="e.g. April Newsletter"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-[#161929] border-white/10 text-white placeholder:text-gray-600 rounded-xl h-11 focus-visible:ring-violet-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-gray-400">Subject line</label>
              <Input
                placeholder="e.g. Here's what's new this month"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="bg-[#161929] border-white/10 text-white placeholder:text-gray-600 rounded-xl h-11 focus-visible:ring-violet-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-gray-400">Email content (HTML or plain text)</label>
              <Textarea
                placeholder="<p>Hello! Here's your update...</p>"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={8}
                className="bg-[#161929] border-white/10 text-white placeholder:text-gray-600 rounded-xl font-mono text-sm focus-visible:ring-violet-500/50"
              />
            </div>
          </div>

          <div className="bg-[#0e1120] border border-white/8 rounded-2xl p-6 space-y-5">
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Recipients</h2>

            <div className="space-y-1.5">
              <label className="text-sm text-gray-400">Email addresses (one per line or comma-separated)</label>
              <Textarea
                placeholder="john@example.com&#10;jane@company.com"
                value={recipientInput}
                onChange={(e) => setRecipientInput(e.target.value)}
                rows={5}
                className="bg-[#161929] border-white/10 text-white placeholder:text-gray-600 rounded-xl font-mono text-sm focus-visible:ring-violet-500/50"
              />
              {parsedEmails.length > 0 && (
                <p className="text-xs text-violet-400">{parsedEmails.length} recipient{parsedEmails.length !== 1 ? "s" : ""} detected</p>
              )}
            </div>
          </div>

          {error && (
            <p className="text-rose-400 text-sm bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 transition-colors px-6 py-2.5 rounded-xl font-semibold text-sm"
            >
              {loading ? "Creating..." : "Create Campaign →"}
            </button>
            <Link href="/dashboard/campaigns">
              <button type="button" className="px-6 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white border border-white/10 hover:border-white/20 transition-colors">
                Cancel
              </button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
