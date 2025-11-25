import React from 'react'
import { useUIStore } from '@/store/ui'
import Sidebar from './Sidebar'
import Header from './Header'

export default function Layout({ children }) {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen)

  return (
    <div className="flex h-screen bg-gradient-to-br from-white via-purple-50 to-blue-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
