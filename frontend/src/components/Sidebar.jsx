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

  return (
    <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-gray-900 text-white transition-all duration-300 overflow-hidden`}>
      <div className="p-6">
        <h1 className="text-2xl font-bold">EmailMkt</h1>
      </div>
      <nav className="mt-8">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="block px-6 py-3 hover:bg-gray-800 transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
