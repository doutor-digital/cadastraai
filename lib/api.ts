// API client for the CadastraAI .NET backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5299'

interface RequestConfig extends RequestInit {
  params?: Record<string, string>
}

class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
    }
  }

  setToken(token: string | null) {
    this.token = token
    if (typeof window !== 'undefined') {
      if (token) localStorage.setItem('auth_token', token)
      else localStorage.removeItem('auth_token')
    }
  }

  getToken() {
    return this.token
  }

  private async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const { params, ...fetchConfig } = config

    let url = `${this.baseUrl}${endpoint}`
    if (params) {
      const searchParams = new URLSearchParams(params)
      url += `?${searchParams.toString()}`
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(config.headers as Record<string, string> | undefined),
    }
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`

    const response = await fetch(url, { ...fetchConfig, headers })

    if (!response.ok) {
      if (response.status === 401) {
        this.setToken(null)
      }
      const error = await response.json().catch(() => ({ message: 'Erro desconhecido' }))
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    if (response.status === 204) return undefined as T
    return response.json()
  }

  get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params })
  }

  post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const api = new ApiClient(API_BASE_URL)

/**
 * Resolve a server-relative path (e.g. "/uploads/empresa-logos/abc.png") into an absolute URL
 * pointing at the API host. External URLs (Google avatars, etc.) pass through unchanged.
 */
export function resolveAssetUrl(path: string | null | undefined): string | null {
  if (!path) return null
  if (/^(https?:|data:)/i.test(path)) return path
  const base = API_BASE_URL.replace(/\/$/, '')
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) return true
  if (error instanceof Error) {
    const msg = error.message.toLowerCase()
    return (
      msg.includes('failed to fetch') ||
      msg.includes('networkerror') ||
      msg.includes('network request failed') ||
      msg.includes('load failed')
    )
  }
  return false
}

async function uploadMultipart<T>(endpoint: string, file: File, fieldName = 'file'): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const fd = new FormData()
  fd.append(fieldName, file)
  const headers: Record<string, string> = {}
  const token = api.getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`
  const response = await fetch(url, { method: 'POST', headers, body: fd })
  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: `HTTP ${response.status}` }))
    throw new Error(err.message || `HTTP ${response.status}`)
  }
  if (response.status === 204) return undefined as T
  return response.json()
}

// ----- DTOs mirroring the backend -----
export interface UserDto {
  id: string
  email: string
  name: string
  avatarUrl?: string | null
  createdAt: string
  lastLoginAt?: string | null
}

export interface AuthResponseDto {
  token: string
  expiresIn: number
  user: UserDto
}

export type MembershipRole = 'Owner' | 'Admin' | 'Member' | 0 | 1 | 2

export interface EmpresaDto {
  id: string
  nome: string
  tipo?: string | null
  logoUrl?: string | null
  ownerUserId: string
  ownerName: string
  createdAt: string
  memberCount: number
  myRole: MembershipRole
}

export interface MemberDto {
  userId: string
  email: string
  name: string
  avatarUrl?: string | null
  role: MembershipRole
  joinedAt: string
}

export type InviteStatus = 'Pending' | 'Accepted' | 'Revoked' | 'Expired' | 0 | 1 | 2 | 3

export interface InviteDto {
  id: string
  empresaId: string
  empresaNome: string
  email: string
  role: MembershipRole
  token: string
  inviteUrl: string
  status: InviteStatus
  createdAt: string
  expiresAt: string
  acceptedAt?: string | null
  emailDelivered?: boolean | null
  emailError?: string | null
}

export interface InvitePreviewDto {
  empresaNome: string
  email: string
  role: MembershipRole
  status: InviteStatus
  expiresAt: string
  existingUser: boolean
}

// ----- Auth -----
export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    api.post<AuthResponseDto>('/api/auth/register', data),

  login: (email: string, password: string) =>
    api.post<AuthResponseDto>('/api/auth/login', { email, password }),

  google: (idToken: string) =>
    api.post<AuthResponseDto>('/api/auth/google', { idToken }),

  me: () => api.get<UserDto>('/api/auth/me'),

  logout: () => api.post('/api/auth/logout'),
}

// ----- Empresas -----
export const empresasApi = {
  list: () => api.get<EmpresaDto[]>('/api/empresas'),
  create: (data: { nome: string; tipo?: string }) =>
    api.post<EmpresaDto>('/api/empresas', data),
  members: (empresaId: string) =>
    api.get<MemberDto[]>(`/api/empresas/${empresaId}/members`),
  removeMember: (empresaId: string, userId: string) =>
    api.delete<void>(`/api/empresas/${empresaId}/members/${userId}`),
  invites: (empresaId: string) =>
    api.get<InviteDto[]>(`/api/empresas/${empresaId}/invites`),
  invite: (empresaId: string, data: { email: string; role?: MembershipRole }) =>
    api.post<InviteDto>(`/api/empresas/${empresaId}/invites`, data),
  revokeInvite: (empresaId: string, inviteId: string) =>
    api.delete<void>(`/api/empresas/${empresaId}/invites/${inviteId}`),
  uploadLogo: (empresaId: string, file: File) =>
    uploadMultipart<EmpresaDto>(`/api/empresas/${empresaId}/logo`, file),
  removeLogo: (empresaId: string) =>
    api.delete<void>(`/api/empresas/${empresaId}/logo`),
}

// ----- Invites (public + acceptance) -----
export const invitesApi = {
  preview: (token: string) => api.get<InvitePreviewDto>(`/api/invites/${token}`),
  acceptWithPassword: (token: string, data: { name: string; password: string }) =>
    api.post<AuthResponseDto>(`/api/invites/${token}/accept-password`, data),
  acceptWithGoogle: (token: string, idToken: string) =>
    api.post<AuthResponseDto>(`/api/invites/${token}/accept-google`, { idToken }),
}
