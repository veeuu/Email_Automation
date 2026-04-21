"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Contact = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  company: string | null;
  tags: string | null;
};

const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all";
const modalBase = "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4";
const modalCard = "w-full bg-[#13131a] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl";

export function ContactsClient({ initialContacts }: { initialContacts: Contact[] }) {
  const router = useRouter();
  const [contacts, setContacts] = useState(initialContacts);
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [form, setForm] = useState({ email: "", name: "", phone: "", company: "", tags: "" });
  const [csvText, setCsvText] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    setLoading(true);
    const res = await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      router.refresh();
      setShowAdd(false);
      setForm({ email: "", name: "", phone: "", company: "", tags: "" });
    }
    setLoading(false);
  }

  async function handleImport() {
    setLoading(true);
    const lines = csvText.split("\n").filter(Boolean);
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const rows = lines.slice(1).map((row) => {
      const vals = row.split(",").map((v) => v.trim());
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => { obj[h] = vals[i] ?? ""; });
      return obj;
    });
    await fetch("/api/contacts/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contacts: rows }),
    });
    router.refresh();
    setShowImport(false);
    setCsvText("");
    setLoading(false);
  }

  async function handleDelete(id: string) {
    await fetch("/api/contacts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setContacts(contacts.filter((c) => c.id !== id));
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Contacts</h1>
          <p className="text-slate-500 text-sm mt-1">{contacts.length} contact{contacts.length !== 1 ? "s" : ""} total</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowImport(true)}
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
          >
            Import CSV
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-indigo-900/40"
          >
            + Add Contact
          </button>
        </div>
      </div>

      {/* Add modal */}
      {showAdd && (
        <div className={modalBase}>
          <div className={`${modalCard} max-w-md`}>
            <h2 className="text-lg font-bold text-white">Add Contact</h2>
            <input placeholder="Email *" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
            <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
            <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} />
            <input placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className={inputCls} />
            <input placeholder="Tags (comma-separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className={inputCls} />
            <div className="flex gap-3 pt-1">
              <button
                onClick={handleAdd}
                disabled={loading || !form.email}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold transition-all"
              >
                {loading ? "Adding..." : "Add Contact"}
              </button>
              <button
                onClick={() => setShowAdd(false)}
                className="px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white border border-white/10 hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import modal */}
      {showImport && (
        <div className={modalBase}>
          <div className={`${modalCard} max-w-2xl`}>
            <h2 className="text-lg font-bold text-white">Import CSV</h2>
            <p className="text-sm text-slate-400">First row must be headers: email, name, phone, company, tags</p>
            <textarea
              placeholder={"email,name,phone,company,tags\njohn@example.com,John Doe,,,newsletter"}
              rows={8}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className={`${inputCls} font-mono resize-none`}
            />
            <div className="flex gap-3">
              <button
                onClick={handleImport}
                disabled={loading || !csvText.trim()}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold transition-all"
              >
                {loading ? "Importing..." : "Import"}
              </button>
              <button
                onClick={() => setShowImport(false)}
                className="px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white border border-white/10 hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total contacts", value: contacts.length, color: "text-indigo-400" },
          { label: "With company", value: contacts.filter((c) => c.company).length, color: "text-violet-400" },
          { label: "Tagged", value: contacts.filter((c) => c.tags).length, color: "text-emerald-400" },
        ].map((s) => (
          <div key={s.label} className="bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {contacts.length === 0 ? (
        <div className="bg-[#0f0f17] border border-dashed border-white/10 rounded-2xl p-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-5">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <p className="text-white font-semibold text-base mb-1">No contacts yet</p>
          <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">Add contacts manually or import a CSV to get started.</p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setShowAdd(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-900/40 transition-all"
            >
              + Add Contact
            </button>
            <button
              onClick={() => setShowImport(true)}
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
            >
              Import CSV
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Company</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tags</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {contacts.map((c) => (
                <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3.5 font-mono text-slate-300">{c.email}</td>
                  <td className="px-5 py-3.5 text-slate-400">{c.name ?? <span className="text-slate-700">—</span>}</td>
                  <td className="px-5 py-3.5 text-slate-400">{c.company ?? <span className="text-slate-700">—</span>}</td>
                  <td className="px-5 py-3.5">
                    {c.tags
                      ? c.tags.split(",").map((t) => (
                          <span key={t} className="inline-block mr-1 px-2 py-0.5 rounded-full text-xs bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                            {t.trim()}
                          </span>
                        ))
                      : <span className="text-slate-700">—</span>}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-xs text-slate-600 hover:text-rose-400 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
