"use client";

import { useEffect, useState } from "react";

interface EmailEvent {
  id: string; eventType: string; createdAt: string;
  campaign: { id: string; name: string; subject: string };
}
interface Enrollment {
  id: string; status: string; enrolledAt: string;
  workflow: { id: string; name: string };
  events: Array<{ id: string; eventType: string; createdAt: string }>;
}
interface Contact {
  email: string; name: string | null; tags: string | null;
  unsubscribed?: boolean; bouncedAt?: string | null;
}

const EVENT_STYLE: Record<string, { color: string; label: string; icon: string }> = {
  SENT:         { color: "bg-sky-100 text-sky-700",      label: "Email sent",        icon: "✉️" },
  OPENED:       { color: "bg-violet-100 text-violet-700", label: "Email opened",      icon: "👁" },
  CLICKED:      { color: "bg-emerald-100 text-emerald-700", label: "Link clicked",    icon: "🔗" },
  BOUNCED:      { color: "bg-rose-100 text-rose-700",    label: "Bounced",           icon: "↩" },
  SPAM:         { color: "bg-orange-100 text-orange-700", label: "Marked spam",       icon: "⚠️" },
  UNSUBSCRIBED: { color: "bg-slate-100 text-slate-600",  label: "Unsubscribed",      icon: "🚫" },
};

export function ActivityPanel({ email, onClose }: { email: string; onClose: () => void }) {
  const [data, setData] = useState<{ contact: Contact; emailEvents: EmailEvent[]; enrollments: Enrollment[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/contacts/activity?email=${encodeURIComponent(email)}`)
      .then((r) => r.json()).then(setData).finally(() => setLoading(false));
  }, [email]);

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/20" onClick={onClose} />
      <div className="w-96 bg-white border-l border-slate-200 flex flex-col overflow-hidden shadow-xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Contact Activity</p>
            <h3 className="text-sm font-bold text-slate-800 mt-0.5 truncate">{email}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {loading ? (
            <div className="text-sm text-slate-400 text-center py-8">Loading...</div>
          ) : !data ? null : (
            <>
              {/* Contact info */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                {data.contact?.name && <div className="text-sm font-semibold text-slate-800">{data.contact.name}</div>}
                <div className="flex flex-wrap gap-1.5">
                  {data.contact?.unsubscribed && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 font-semibold">Unsubscribed</span>
                  )}
                  {data.contact?.tags?.split(",").map((t) => (
                    <span key={t} className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600">{t.trim()}</span>
                  ))}
                </div>
              </div>

              {/* Workflow enrollments */}
              {data.enrollments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Workflows</p>
                  {data.enrollments.map((e) => (
                    <div key={e.id} className="border border-slate-200 rounded-xl p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <a href={`/dashboard/workflows/${e.workflow.id}`} className="text-xs font-semibold text-indigo-600 hover:underline">{e.workflow.name}</a>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                          e.status === "COMPLETED" ? "text-emerald-600 bg-emerald-50 border-emerald-200" :
                          e.status === "ACTIVE" ? "text-sky-600 bg-sky-50 border-sky-200" :
                          "text-slate-500 bg-slate-100 border-slate-200"
                        }`}>{e.status}</span>
                      </div>
                      <p className="text-[10px] text-slate-400">Enrolled {new Date(e.enrolledAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Email timeline */}
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Email History ({data.emailEvents.length})
                </p>
                {data.emailEvents.length === 0 ? (
                  <p className="text-xs text-slate-400">No email activity yet.</p>
                ) : (
                  <div className="space-y-2">
                    {data.emailEvents.map((ev) => {
                      const style = EVENT_STYLE[ev.eventType] ?? EVENT_STYLE.SENT;
                      return (
                        <div key={ev.id} className="flex items-start gap-3">
                          <div className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 mt-0.5 ${style.color}`}>
                            {style.icon} {style.label}
                          </div>
                          <div className="flex-1 min-w-0">
                            <a href={`/dashboard/campaigns/${ev.campaign.id}`} className="text-xs font-medium text-slate-700 hover:text-indigo-600 truncate block">{ev.campaign.name}</a>
                            <p className="text-[10px] text-slate-400">{new Date(ev.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
