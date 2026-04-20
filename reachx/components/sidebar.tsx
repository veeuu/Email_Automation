import Link from "next/link";

export function Sidebar({ email }: { email: string }) {
  return (
    <aside className="w-64 border-r border-gray-200 bg-white flex flex-col p-5 gap-1 shadow-sm">
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-lg">
          R
        </div>
        <span className="font-bold text-gray-900">ReachX</span>
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
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors font-medium"
        >
          <span className="text-base w-5 text-center">{item.icon}</span>
          {item.label}
        </Link>
      ))}

      <div className="mt-auto border-t border-gray-200 pt-4 space-y-1">
        <div className="px-3 py-2 text-xs text-gray-400 truncate">{email}</div>
        <Link
          href="/api/auth/signout"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
          <span>↩</span> Sign out
        </Link>
      </div>
    </aside>
  );
}
