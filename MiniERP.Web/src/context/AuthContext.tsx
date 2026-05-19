import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { api, clearAuth, getStoredUser, getToken, setStoredUser, setToken } from '../api/client'
import type { AuthResponse } from '../types'

interface AuthContextValue {
  user: { email: string; fullName: string; role: string } | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readStoredSession() {
  const storedUser = getStoredUser()
  const token = getToken()
  if (storedUser && token) return storedUser
  if (storedUser || token) clearAuth()
  return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(readStoredSession)

  useEffect(() => {
    const onLogout = () => setUser(null)
    window.addEventListener('minierp:logout', onLogout)
    return () => window.removeEventListener('minierp:logout', onLogout)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<AuthResponse>(
      '/api/auth/login',
      { email, password },
      false
    )
    if (!res.token) {
      throw new Error('Sunucudan geçerli oturum bilgisi alınamadı.')
    }
    setToken(res.token)
    const u = { email: res.email, fullName: res.fullName, role: res.role }
    setStoredUser(u)
    setUser(u)
  }, [])

  const logout = useCallback(() => {
    clearAuth()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user && !!getToken(),
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
