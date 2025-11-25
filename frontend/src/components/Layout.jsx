import React from 'react'
import { useUIStore } from '@/store/ui'
import Sidebar from './Sidebar'
import Header from './Header'

export default function Layout({ children }) {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen)

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className={`flex-1 overflow-auto ${sidebarOpen ? 'ml-0' : 'ml-0'}`}>
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
