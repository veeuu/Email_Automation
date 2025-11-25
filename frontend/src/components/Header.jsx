import React from 'react'
import { useUIStore } from '@/store/ui'
import { useAuthStore } from '@/store/auth'

export default function Header() {
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  return (
    <header className="bg-white shadow">
      <div className="flex items-center justify-between px-8 py-4">
        <button
          onClick={toggleSidebar}
          className="text-gray-600 hover:text-gray-900"
        >
          ☰
        </button>
        <div className="flex items-center gap-4">
          <span className="text-gray-700">{user?.full_name}</span>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
