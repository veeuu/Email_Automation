import Link from "next/link";

export function Sidebar({ email }: { email: string }) {
  return (
    <aside className="w-60 border-r border-white/5 flex flex-col p-5 gap-1">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-7 h-7 rounded-lg bg-violet-500 flex items-center justify-center text-xs font-bold">R</div>
        <span className="font-semibold text-sm">ReachX</span>
      </div>

      {[
        { label: "Dashboard", href: "/dashboard", icon: "▦" },
        { label: "Campaigns", href: "/dashboard/campaigns", icon: "✉" },
        { label: "Validate Emails", href: "/validate", icon: "✓" },
        { label: "Analytics", href: "/dashboard/analytics", icon: "↗" },
      ].map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <span className="text-base">{item.icon}</span>
          {item.label}
        </Link>
      ))}

      <div className="mt-auto border-t border-white/5 pt-4">
        <div className="px-3 py-2 text-xs text-gray-600 truncate">{email}</div>
        <Link href="/api/auth/signout" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-white hover:bg-white/5 transition-colors">
          <span>↩</span> Sign out
        </Link>
      </div>
    </aside>
  );
}
