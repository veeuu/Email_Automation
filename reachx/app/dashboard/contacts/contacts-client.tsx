"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Contact = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  company: string | null;
  tags: string | null;
};

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
    const lines = csvText.split("\n").filter(Boolean);
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const rows = lines.slice(1);

    const parsed = rows.map((row) => {
      const vals = row.split(",").map((v) => v.trim());
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => { obj[h] = vals[i] ?? ""; });
      return obj;
    });

    setLoading(true);
    await fetch("/api/contacts/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contacts: parsed }),
    });
    router.refresh();
    setShowImport(false);
    setCsvText("");
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this contact?")) return;
    await fetch("/api/contacts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setContacts(contacts.filter((c) => c.id !== id));
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-500 text-sm mt-1">{contacts.length} contact{contacts.length !== 1 ? "s" : ""} total</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowImport(true)}
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Import CSV
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/25 transition-all"
          >
            + Add Contact
          </button>
        </div>
      </div>

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900">Add Contact</h2>
            <Input placeholder="Email *" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-xl" />
            <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl" />
            <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-xl" />
            <Input placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="rounded-xl" />
            <Input placeholder="Tags (comma-separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="rounded-xl" />
            <div className="flex gap-3">
              <button onClick={handleAdd} disabled={loading || !form.email} className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-xl font-medium disabled:opacity-50">
                {loading ? "Adding..." : "Add"}
              </button>
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-xl text-gray-600 border border-gray-200">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Import modal */}
      {showImport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full space-y-4 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900">Import CSV</h2>
            <p className="text-sm text-gray-500">Paste CSV with headers: email, name, phone, company, tags</p>
            <Textarea
              placeholder="email,name,phone,company,tags&#10;john@example.com,John Doe,555-1234,Acme Inc,vip"
              rows={8}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="font-mono text-sm rounded-xl"
            />
            <div className="flex gap-3">
              <button onClick={handleImport} disabled={loading || !csvText} className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-xl font-medium disabled:opacity-50">
                {loading ? "Importing..." : "Import"}
              </button>
              <button onClick={() => setShowImport(false)} className="px-4 py-2 rounded-xl text-gray-600 border border-gray-200">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {contacts.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
          <div className="text-4xl mb-3">👥</div>
          <p className="text-gray-500">No contacts yet.</p>
          <button onClick={() => setShowAdd(true)} className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2 rounded-xl text-sm font-medium shadow-lg shadow-blue-500/25">
            Add your first contact
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider bg-gray-50">
                <th className="text-left px-5 py-3 font-semibold">Email</th>
                <th className="text-left px-5 py-3 font-semibold">Name</th>
                <th className="text-left px-5 py-3 font-semibold">Phone</th>
                <th className="text-left px-5 py-3 font-semibold">Company</th>
                <th className="text-left px-5 py-3 font-semibold">Tags</th>
                <th className="text-right px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-mono text-gray-700">{c.email}</td>
                  <td className="px-5 py-3 text-gray-600">{c.name ?? "—"}</td>
                  <td className="px-5 py-3 text-gray-600">{c.phone ?? "—"}</td>
                  <td className="px-5 py-3 text-gray-600">{c.company ?? "—"}</td>
                  <td className="px-5 py-3 text-gray-600">{c.tags ?? "—"}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-700 text-xs">Delete</button>
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
