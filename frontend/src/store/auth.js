import { create } from 'zustand'
import { User } from '@/api/auth'

interface AuthStore {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: localStorage.getItem('access_token'),
  isAuthenticated: !!localStorage.getItem('access_token'),
  
  setUser: (user) => set({ user }),
  
  setToken: (token) => {
    if (token) {
      localStorage.setItem('access_token', token)
    } else {
      localStorage.removeItem('access_token')
    }
    set({ token, isAuthenticated: !!token })
  },
  
  logout: () => {
    localStorage.removeItem('access_token')
    set({ user: null, token: null, isAuthenticated: false })
  },
}))
