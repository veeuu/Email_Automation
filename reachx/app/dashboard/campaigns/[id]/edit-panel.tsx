"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  campaignId: string;
  name: string;
  subject: string;
  content: string;
};

export function EditPanel({ campaignId, name, subject, content }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name, subject, content });
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    await fetch(`/api/campaigns/${campaignId}/edit`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    router.refresh();
    setOpen(false);
    setLoading(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
      >
        Edit
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full space-y-4 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900">Edit Campaign</h2>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Campaign name</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Subject line</label>
              <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Email content</label>
              <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={8} className="rounded-xl font-mono text-sm" />
            </div>
            <div className="flex gap-3">
              <button onClick={handleSave} disabled={loading} className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-xl font-medium disabled:opacity-50">
                {loading ? "Saving..." : "Save changes"}
              </button>
              <button onClick={() => setOpen(false)} className="px-4 py-2 rounded-xl text-gray-600 border border-gray-200">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
