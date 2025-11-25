import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth.js'
import { authAPI } from '@/api/auth.js'
import Login from '@/pages/Login.jsx'
import Dashboard from '@/pages/Dashboard.jsx'
import Subscribers from '@/pages/Subscribers.jsx'
import Campaigns from '@/pages/Campaigns.jsx'
import Templates from '@/pages/Templates.jsx'
import Analytics from '@/pages/Analytics.jsx'
import Automation from '@/pages/Automation.jsx'
import Settings from '@/pages/Settings.jsx'

const queryClient = new QueryClient()

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

export default function App() {
  const setUser = useAuthStore((state) => state.setUser)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  useEffect(() => {
    if (isAuthenticated) {
      authAPI.getMe().then((res) => setUser(res.data)).catch(() => {
        useAuthStore.setState({ isAuthenticated: false })
      })
    }
  }, [isAuthenticated, setUser])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subscribers"
            element={
              <ProtectedRoute>
                <Subscribers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/campaigns"
            element={
              <ProtectedRoute>
                <Campaigns />
              </ProtectedRoute>
            }
          />
          <Route
            path="/templates"
            element={
              <ProtectedRoute>
                <Templates />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/automation"
            element={
              <ProtectedRoute>
                <Automation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
