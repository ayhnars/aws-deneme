import type { ApiError } from '../types'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

function getToken(): string | null {
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
    return JSON.parse(raw) as { email: string; fullName: string; role: string }
  } catch {
    return null
  }
}

export function setStoredUser(user: { email: string; fullName: string; role: string } | null) {
  if (user) localStorage.setItem('minierp_user', JSON.stringify(user))
  else localStorage.removeItem('minierp_user')
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = true
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (auth) {
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })

  if (!res.ok) {
    let body: ApiError = {}
    try {
      body = await res.json()
    } catch {
      /* empty */
    }
    throw new Error(body.message ?? body.error ?? `HTTP ${res.status}`)
  }

  if (res.status === 204) return undefined as T
  const text = await res.text()
  if (!text) return undefined as T
  return JSON.parse(text) as T
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown, auth = true) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }, auth),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
