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
    if (!parsedEmails.length) { setError("Add at least one recipient"); return; }
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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/campaigns" className="text-gray-400 hover:text-gray-600 transition-colors text-sm">
            ← Campaigns
          </Link>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Campaign</h1>
          <p className="text-gray-500 text-sm mt-1">Fill in the details and add your recipients.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Campaign details</h2>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Campaign name</label>
              <Input
                placeholder="e.g. April Newsletter"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-gray-50 border-gray-200 rounded-xl h-11 focus-visible:ring-blue-500 focus-visible:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Subject line</label>
              <Input
                placeholder="e.g. Here's what's new this month"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="bg-gray-50 border-gray-200 rounded-xl h-11 focus-visible:ring-blue-500 focus-visible:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Email content (HTML or plain text)</label>
              <Textarea
                placeholder="<p>Hello! Here's your update...</p>"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={8}
                className="bg-gray-50 border-gray-200 rounded-xl font-mono text-sm focus-visible:ring-blue-500 focus-visible:border-blue-500"
              />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recipients</h2>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Email addresses (one per line or comma-separated)</label>
              <Textarea
                placeholder="john@example.com&#10;jane@company.com"
                value={recipientInput}
                onChange={(e) => setRecipientInput(e.target.value)}
                rows={5}
                className="bg-gray-50 border-gray-200 rounded-xl font-mono text-sm focus-visible:ring-blue-500 focus-visible:border-blue-500"
              />
              {parsedEmails.length > 0 && (
                <p className="text-xs text-blue-600 font-medium">{parsedEmails.length} recipient{parsedEmails.length !== 1 ? "s" : ""} detected</p>
              )}
            </div>
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all"
            >
              {loading ? "Creating..." : "Create Campaign →"}
            </button>
            <Link href="/dashboard/campaigns">
              <button type="button" className="px-6 py-2.5 rounded-xl text-sm text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
