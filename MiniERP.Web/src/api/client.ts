import type { ApiError } from '../types'

/**
 * API base (no trailing slash)
 * Example: http://51.20.54.128
 */
export const API_BASE = (import.meta.env.VITE_API_URL ?? '')
  .trim()
  .replace(/\/+$/, '')

/**
 * Safe URL builder
 * Ensures: http://host/api/Auth/login
 */
export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return API_BASE ? `${API_BASE}${normalizedPath}` : normalizedPath
}

/**
 * API ENDPOINTS (STRICT RULE: always start with /api)
 */
export const API_PATHS = {
  auth: {
    login: '/api/Auth/login',
    register: '/api/Auth/register',
  },
  products: '/api/Products',
  stockMovements: '/api/StockMovements',
} as const

// =========================
// AUTH HELPERS
// =========================

export function getToken(): string | null {
  return localStorage.getItem('minierp_token')
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem('minierp_token', token)
  else localStorage.removeItem('minierp_token')
}

export function getStoredUser() {
  const raw = localStorage.getItem('minierp_user')
  if (!raw) return null

  try {
    return JSON.parse(raw) as {
      email: string
      fullName: string
      role: string
    }
  } catch {
    return null
  }
}

export function setStoredUser(user: {
  email: string
  fullName: string
  role: string
} | null) {
  if (user) localStorage.setItem('minierp_user', JSON.stringify(user))
  else localStorage.removeItem('minierp_user')
}

export function clearAuth() {
  setToken(null)
  setStoredUser(null)
  window.dispatchEvent(new Event('minierp:logout'))
}

// =========================
// CORE REQUEST WRAPPER
// =========================

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = true
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  // AUTH HEADER
  if (auth) {
    const token = getToken()
    if (!token) {
      clearAuth()
      throw new Error('Oturum bulunamadı. Lütfen tekrar giriş yapın.')
    }
    headers['Authorization'] = `Bearer ${token}`
  }

  const url = apiUrl(path)

  // DEBUG (VERY IMPORTANT)
  console.log('[API REQUEST]', url)

  const res = await fetch(url, { ...options, headers })

  if (!res.ok) {
    let body: ApiError & {
      title?: string
      errors?: Record<string, string[]>
    } = {}

    try {
      body = await res.json()
    } catch {
      // ignore
    }

    if (res.status === 401 && auth) {
      clearAuth()
      throw new Error(
        body.message ?? 'Oturum süresi doldu. Lütfen tekrar giriş yapın.'
      )
    }

    if (body.errors) {
      const details = Object.values(body.errors).flat().join(' ')
      throw new Error(details || body.title || `HTTP ${res.status}`)
    }

    throw new Error(
      body.message ?? body.error ?? body.title ?? `HTTP ${res.status}`
    )
  }

  if (res.status === 204) return undefined as T

  const text = await res.text()
  return text ? (JSON.parse(text) as T) : (undefined as T)
}

// =========================
// API METHODS
// =========================

export const api = {
  get: <T>(path: string) => request<T>(path),

  post: <T>(path: string, body: unknown, auth = true) =>
    request<T>(
      path,
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
      auth
    ),

  put: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  delete: <T>(path: string) =>
    request<T>(path, {
      method: 'DELETE',
    }),
}