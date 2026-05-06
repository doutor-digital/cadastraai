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

  async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
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

  patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
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

// ============================================================================
// Domínio: Lead / Consulta / Tratamento / Recebimento / MotivoNaoFechamento
// ============================================================================

export type CorSemaforoDto = 'verde' | 'amarelo' | 'vermelho'

export interface RecebimentoDto {
  id: string
  consultaId?: string | null
  tratamentoId?: string | null
  valorRecebimento: number
  formaPagamento: string
  dataRecebimento: string
}

export interface TratamentoDto {
  id: string
  consultaId: string
  planoTratamento: string
  planoPilates?: string | null
  musculacao?: string | null
  procedimento?: string | null
  valorPlano: number
  createdAt: string
  recebimentos: RecebimentoDto[]
}

export interface ConsultaDto {
  id: string
  leadId: string
  valorConsulta: number
  pagamentoAntecipado: boolean
  tratamentoIndicado: string
  orcamento: number
  compareceu: boolean
  fechouTratamento: boolean
  motivoNaoFechamento?: string | null
  createdAt: string
  tratamento?: TratamentoDto | null
  recebimentos: RecebimentoDto[]
}

export interface LeadSummaryDto {
  id: string
  empresaId: string
  nome: string
  telefone: string
  origem: string
  tipo: string
  tipoResgate?: string | null
  interacao: boolean
  agendouConsulta: boolean
  pagamentoAntecipado: boolean
  dataAgendamento?: string | null
  motivoNaoAgendamento?: string | null
  nomeResponsavel: string
  createdAt: string
  temConsulta: boolean
  compareceu?: boolean | null
  fechouTratamento?: boolean | null
  motivoNaoFechamento?: string | null
}

export interface LeadDetailDto {
  id: string
  empresaId: string
  nome: string
  telefone: string
  origem: string
  tipo: string
  tipoResgate?: string | null
  interacao: boolean
  agendouConsulta: boolean
  pagamentoAntecipado: boolean
  dataAgendamento?: string | null
  motivoNaoAgendamento?: string | null
  nomeResponsavel: string
  createdAt: string
  consulta?: ConsultaDto | null
}

export interface MotivoNaoFechamentoDto {
  id: string
  empresaId: string
  nome: string
  cor: CorSemaforoDto
  isDefault: boolean
  createdAt: string
}

export interface CreateLeadPayload {
  nome: string
  telefone: string
  origem: string
  tipo: string
  tipoResgate?: string
  interacao: boolean
  agendouConsulta: boolean
  pagamentoAntecipado: boolean
  dataAgendamento?: string
  motivoNaoAgendamento?: string
  nomeResponsavel: string
  createdAt?: string
}

export type UpdateLeadPayload = Partial<CreateLeadPayload>

export interface CreateConsultaPayload {
  valorConsulta: number
  pagamentoAntecipado: boolean
  tratamentoIndicado: string
  orcamento: number
  compareceu: boolean
  fechouTratamento: boolean
  motivoNaoFechamento?: string
}

export type UpdateConsultaPayload = Partial<CreateConsultaPayload>

export interface CreateTratamentoPayload {
  planoTratamento: string
  planoPilates?: string
  musculacao?: string
  procedimento?: string
  valorPlano: number
}

export type UpdateTratamentoPayload = Partial<CreateTratamentoPayload>

export interface CreateRecebimentoPayload {
  valorRecebimento: number
  formaPagamento: string
  dataRecebimento: string
}

export interface BulkLeadErrorDto {
  index: number
  error: string
}

export interface BulkCreateLeadsResponse {
  totalReceived: number
  createdCount: number
  failedCount: number
  created: LeadDetailDto[]
  failed: BulkLeadErrorDto[]
}

export interface PaginatedLeads {
  items: LeadSummaryDto[]
  total: number
  page: number
  pageSize: number
}

export interface ListLeadsParams {
  page?: number
  pageSize?: number
  search?: string
  status?: 'todos' | 'agendados' | 'nao_agendados'
}

export interface LeadsStatsPeriod {
  leads: number
  agendados: number
  comConsulta: number
  compareceram: number
  fecharam: number
  cadastros: number
  resgates: number
}

export interface OrigemBucket {
  nome: string
  count: number
}

export interface ResponsavelBucket {
  nome: string
  leads: number
  compareceram: number
  fecharam: number
}

export interface LeadsStatsResponse {
  current: LeadsStatsPeriod
  previous: LeadsStatsPeriod | null
  topOrigens: OrigemBucket[]
  topResponsaveis: ResponsavelBucket[]
}

export interface StatsParams {
  from?: string
  to?: string
  prevFrom?: string
  prevTo?: string
}

// ----- Leads -----
export const leadsApi = {
  list: (empresaId: string, params: ListLeadsParams = {}) => {
    const q: Record<string, string> = {}
    if (params.page !== undefined) q.page = String(params.page)
    if (params.pageSize !== undefined) q.pageSize = String(params.pageSize)
    if (params.search) q.search = params.search
    if (params.status && params.status !== 'todos') q.status = params.status
    return api.get<PaginatedLeads>(`/api/empresas/${empresaId}/leads`, q)
  },
  stats: (empresaId: string, params: StatsParams) => {
    const q: Record<string, string> = {}
    if (params.from) q.from = params.from
    if (params.to) q.to = params.to
    if (params.prevFrom) q.prevFrom = params.prevFrom
    if (params.prevTo) q.prevTo = params.prevTo
    return api.get<LeadsStatsResponse>(`/api/empresas/${empresaId}/leads/stats`, q)
  },
  get: (leadId: string) => api.get<LeadDetailDto>(`/api/leads/${leadId}`),
  create: (empresaId: string, data: CreateLeadPayload) =>
    api.post<LeadDetailDto>(`/api/empresas/${empresaId}/leads`, data),
  bulkCreate: (empresaId: string, leads: CreateLeadPayload[]) =>
    api.post<BulkCreateLeadsResponse>(`/api/empresas/${empresaId}/leads/bulk`, { leads }),
  update: (leadId: string, data: UpdateLeadPayload) =>
    api.patch<LeadDetailDto>(`/api/leads/${leadId}`, data),
  delete: (leadId: string) => api.delete<void>(`/api/leads/${leadId}`),
}

// ----- Consultas -----
export const consultasApi = {
  create: (leadId: string, data: CreateConsultaPayload) =>
    api.post<ConsultaDto>(`/api/leads/${leadId}/consulta`, data),
  update: (consultaId: string, data: UpdateConsultaPayload) =>
    api.patch<ConsultaDto>(`/api/consultas/${consultaId}`, data),
  delete: (consultaId: string) => api.delete<void>(`/api/consultas/${consultaId}`),
}

// ----- Tratamentos -----
export const tratamentosApi = {
  create: (consultaId: string, data: CreateTratamentoPayload) =>
    api.post<TratamentoDto>(`/api/consultas/${consultaId}/tratamento`, data),
  update: (tratamentoId: string, data: UpdateTratamentoPayload) =>
    api.patch<TratamentoDto>(`/api/tratamentos/${tratamentoId}`, data),
  delete: (tratamentoId: string) => api.delete<void>(`/api/tratamentos/${tratamentoId}`),
}

// ----- Recebimentos -----
export const recebimentosApi = {
  createForConsulta: (consultaId: string, data: CreateRecebimentoPayload) =>
    api.post<RecebimentoDto>(`/api/consultas/${consultaId}/recebimentos`, data),
  createForTratamento: (tratamentoId: string, data: CreateRecebimentoPayload) =>
    api.post<RecebimentoDto>(`/api/tratamentos/${tratamentoId}/recebimentos`, data),
  delete: (recebimentoId: string) => api.delete<void>(`/api/recebimentos/${recebimentoId}`),
}

// ----- Motivos de não fechamento -----
export const motivosNaoFechamentoApi = {
  list: (empresaId: string) =>
    api.get<MotivoNaoFechamentoDto[]>(`/api/empresas/${empresaId}/motivos-nao-fechamento`),
  create: (empresaId: string, data: { nome: string; cor: CorSemaforoDto }) =>
    api.post<MotivoNaoFechamentoDto>(`/api/empresas/${empresaId}/motivos-nao-fechamento`, data),
  delete: (empresaId: string, motivoId: string) =>
    api.delete<void>(`/api/empresas/${empresaId}/motivos-nao-fechamento/${motivoId}`),
}
