import React from 'react'
import { Link } from 'react-router-dom'
import { useUIStore } from '@/store/ui'

export default function Sidebar() {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen)

  const menuItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Subscribers', path: '/subscribers' },
    { label: 'Templates', path: '/templates' },
    { label: 'Campaigns', path: '/campaigns' },
    { label: 'Automation', path: '/automation' },
    { label: 'Analytics', path: '/analytics' },
    { label: 'Settings', path: '/settings' },
  ]

  const menuIcons = {
    '/': '📊',
    '/subscribers': '👥',
    '/templates': '📝',
    '/campaigns': '📧',
    '/automation': '⚙️',
    '/analytics': '📈',
    '/settings': '⚙️',
  }

  return (
    <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-gradient-to-b from-white via-purple-50 to-blue-50 text-gray-800 transition-all duration-300 overflow-hidden shadow-lg border-r border-purple-100`}>
      <div className="p-6 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-blue-50">
        <h1 className="text-xl font-bold text-gray-900">
          ✉️ EmailFlow
        </h1>
      </div>
      <nav className="mt-6 space-y-1 px-3">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-purple-100 transition-all duration-200 font-medium text-sm text-gray-700 hover:text-indigo-600 active:bg-purple-100"
          >
            <span className="text-lg">{menuIcons[item.path]}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
