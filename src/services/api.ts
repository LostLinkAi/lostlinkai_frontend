const TOKEN_KEY = 'lostlink_token'
const USER_KEY = 'lostlink_user'

const DEV_API_URL = 'http://localhost:5000/api/v1'
const PROD_API_URL = 'https://lostlinkai-backend.onrender.com/api/v1'

const isProduction = Boolean(
  (import.meta as any).env?.PROD || (import.meta as any).env?.MODE === 'production'
)

const envBase = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined

export const API_BASE_URL: string = (() => {
  if (envBase && envBase.trim() !== '') {
    // If running in production but the env still pointed to localhost, prefer live Render link
    if (isProduction && envBase.includes('localhost')) {
      return PROD_API_URL
    }
    return envBase.trim().replace(/\/+$/, '')
  }
  return isProduction ? PROD_API_URL : DEV_API_URL
})()

export const BACKEND_ROOT_URL: string = API_BASE_URL.replace(/\/api\/v1\/?$/, '')

console.log(
  `%c[LostLink AI]%c Running in %c${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}%c mode. API Base: %c${API_BASE_URL}`,
  'background: #2563eb; color: #fff; padding: 2px 6px; border-radius: 3px; font-weight: bold;',
  'color: inherit;',
  'color: #10b981; font-weight: bold;',
  'color: inherit;',
  'color: #3b82f6; text-decoration: underline;'
)

export function resolveApiUrl(path: string): string {
  if (!path) return ''
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return path
  }
  const clean = path.startsWith('/') ? path : `/${path}`
  if (clean.startsWith('/api/v1')) {
    return `${BACKEND_ROOT_URL}${clean}`
  }
  return `${API_BASE_URL}${clean}`
}

export interface ApiError {
  status: number
  message: string
  code?: string
  errors?: Array<{ path: string; message: string }>
}

export class ApiException extends Error {
  status: number
  code?: string
  errors?: Array<{ path: string; message: string }>

  constructor(status: number, message: string, code?: string, errors?: Array<{ path: string; message: string }>) {
    super(message)
    this.name = 'ApiException'
    this.status = status
    this.code = code
    this.errors = errors
  }
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

export function getStoredUser<T = unknown>(): T | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function setStoredUser(user: unknown): void {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(USER_KEY)
  }
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = options.method || 'GET'
  const token = getStoredToken()
  const headers = new Headers(options.headers || {})

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json')
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const url = resolveApiUrl(path)
  const startTime = Date.now()

  let response: Response
  try {
    response = await fetch(url, {
      ...options,
      headers,
    })
  } catch (networkError: any) {
    const elapsed = Date.now() - startTime
    const isRender = url.includes('onrender.com')
    const hint = isRender
      ? 'Render free instances spin down when inactive. If waking up, wait 40-60s and try again.'
      : 'Verify your local backend server is running on http://localhost:5000.'

    console.error(
      `%c[API NETWORK FAILURE]%c ${method} ${url} (${elapsed}ms):`,
      'color: #ef4444; font-weight: bold;',
      'color: inherit;',
      networkError
    )

    throw new ApiException(
      0,
      `Cannot connect to backend (${method} ${path}). ${hint}`,
      'NETWORK_ERROR'
    )
  }

  const elapsed = Date.now() - startTime

  if (response.status === 204) {
    console.log(`[API 204] ${method} ${url} (${elapsed}ms)`)
    return {} as T
  }

  let body: any = null
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    try {
      body = await response.json()
    } catch {
      body = null
    }
  } else {
    try {
      body = await response.text()
    } catch {
      body = null
    }
  }

  if (!response.ok) {
    if (response.status === 401) {
      clearAuth()
    }

    const message = (typeof body === 'object' && body?.message) || response.statusText || 'Request failed'
    const code = (typeof body === 'object' && body?.code) || `HTTP_${response.status}`
    const errors = (typeof body === 'object' && body?.errors) || undefined

    console.warn(
      `%c[API ${response.status}]%c ${method} ${url} (${elapsed}ms) - %c${code}: ${message}`,
      'color: #f59e0b; font-weight: bold;',
      'color: inherit;',
      'color: #ef4444;',
      body
    )

    throw new ApiException(response.status, message, code, errors)
  }

  console.log(`%c[API ${response.status}]%c ${method} ${url} (${elapsed}ms)`)
  return body as T
}

export const api = {
  get: <T>(path: string, options?: RequestInit) => request<T>(path, { method: 'GET', ...options }),
  post: <T>(path: string, data?: unknown, options?: RequestInit) =>
    request<T>(path, {
      method: 'POST',
      body: data instanceof FormData ? data : data !== undefined ? JSON.stringify(data) : undefined,
      ...options,
    }),
  patch: <T>(path: string, data?: unknown, options?: RequestInit) =>
    request<T>(path, {
      method: 'PATCH',
      body: data instanceof FormData ? data : data !== undefined ? JSON.stringify(data) : undefined,
      ...options,
    }),
  delete: <T>(path: string, options?: RequestInit) => request<T>(path, { method: 'DELETE', ...options }),
  upload: <T>(path: string, formData: FormData, options?: RequestInit) =>
    request<T>(path, {
      method: 'POST',
      body: formData,
      ...options,
    }),
}
