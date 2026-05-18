import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { api, setStoredUser, setToken, getStoredUser } from '../api/client'
import type { AuthResponse } from '../types'

interface AuthContextValue {
  user: { email: string; fullName: string; role: string } | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(getStoredUser)

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<AuthResponse>(
      '/api/auth/login',
      { email, password },
      false
    )
    setToken(res.token)
    const u = { email: res.email, fullName: res.fullName, role: res.role }
    setStoredUser(u)
    setUser(u)
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setStoredUser(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      login,
      logout,
    }),
    [user, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
