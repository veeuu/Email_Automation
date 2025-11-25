import React from 'react'
import { useUIStore } from '@/store/ui'
import { useAuthStore } from '@/store/auth'

export default function Header() {
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  return (
    <header className="bg-gradient-to-r from-white via-purple-50 to-blue-50 border-b border-purple-100 shadow-sm">
      <div className="flex items-center justify-between px-6 py-3">
        <button
          onClick={toggleSidebar}
          className="text-gray-600 hover:text-gray-900 transition-colors text-xl"
        >
          ☰
        </button>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-xs font-medium"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
