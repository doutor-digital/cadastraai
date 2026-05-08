// Server-side client for Kommo's API v4.
// Docs: https://developers.kommo.com/reference
import 'server-only'

interface KommoListLeadsParams {
  limit?: number
  page?: number
  query?: string
  with?: string[]
}

export interface KommoEmbedded<T> {
  _embedded?: T
  _page?: number
}

export interface KommoCustomFieldValue {
  field_id?: number
  field_name?: string
  field_code?: string
  field_type?: string
  values?: { value?: unknown; enum_id?: number; enum_code?: string }[]
}

export interface KommoLead {
  id: number
  name?: string
  price?: number
  responsible_user_id?: number
  status_id?: number
  pipeline_id?: number
  created_at?: number  // Kommo returns unix seconds
  updated_at?: number
  custom_fields_values?: KommoCustomFieldValue[]
  _embedded?: {
    contacts?: { id: number; name?: string; first_name?: string; last_name?: string }[]
    tags?: { id: number; name: string }[]
  }
}

export interface KommoContact {
  id: number
  name?: string
  first_name?: string
  last_name?: string
  responsible_user_id?: number
  custom_fields_values?: KommoCustomFieldValue[]
  _embedded?: {
    leads?: { id: number }[]
  }
}

interface KommoListResponse<T> {
  _page?: number
  _embedded: T
}

function buildBase(subdomain: string): string {
  // Subdomain like "minha-conta" — endpoint is https://minha-conta.kommo.com
  return `https://${subdomain.trim().replace(/^https?:\/\//, '').replace(/\.kommo\.com$/, '')}.kommo.com`
}

async function call<T>(
  subdomain: string,
  accessToken: string,
  pathAndQuery: string,
): Promise<T> {
  const url = `${buildBase(subdomain)}${pathAndQuery}`
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
    // Don't cache — Kommo data changes; this is server-side anyway.
    cache: 'no-store',
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Kommo ${res.status} ${res.statusText} — ${text.slice(0, 240)}`)
  }
  // Kommo returns 204 when there are no more pages.
  if (res.status === 204) return { _embedded: {} } as T
  return (await res.json()) as T
}

export async function fetchLeads(
  subdomain: string,
  accessToken: string,
  params: KommoListLeadsParams = {},
): Promise<KommoLead[]> {
  const limit = params.limit ?? 50
  const page = params.page ?? 1
  const withParts = params.with && params.with.length > 0 ? `&with=${params.with.join(',')}` : ''
  const queryPart = params.query ? `&query=${encodeURIComponent(params.query)}` : ''
  const path = `/api/v4/leads?limit=${limit}&page=${page}${withParts}${queryPart}`
  const data = await call<KommoListResponse<{ leads?: KommoLead[] }>>(subdomain, accessToken, path)
  return data._embedded?.leads ?? []
}

export async function fetchContact(
  subdomain: string,
  accessToken: string,
  contactId: number,
): Promise<KommoContact | null> {
  try {
    const data = await call<KommoContact>(subdomain, accessToken, `/api/v4/contacts/${contactId}`)
    return data
  } catch {
    return null
  }
}

// Fetches lead + their first contact merged into a single record we'll feed to the inbox.
export async function fetchLeadsWithContacts(
  subdomain: string,
  accessToken: string,
  params: KommoListLeadsParams = {},
): Promise<{ lead: KommoLead; contact: KommoContact | null }[]> {
  const leads = await fetchLeads(subdomain, accessToken, {
    ...params,
    with: Array.from(new Set([...(params.with ?? []), 'contacts'])),
  })
  const out: { lead: KommoLead; contact: KommoContact | null }[] = []
  for (const lead of leads) {
    const firstContactId = lead._embedded?.contacts?.[0]?.id
    const contact = firstContactId
      ? await fetchContact(subdomain, accessToken, firstContactId)
      : null
    out.push({ lead, contact })
  }
  return out
}

// Quick health check — used by the Configuração tab to validate creds.
export async function ping(subdomain: string, accessToken: string): Promise<{ ok: boolean; account?: { name?: string; subdomain?: string }; error?: string }> {
  try {
    const data = await call<{ name?: string; subdomain?: string }>(
      subdomain,
      accessToken,
      '/api/v4/account',
    )
    return { ok: true, account: { name: data.name, subdomain: data.subdomain } }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Erro desconhecido' }
  }
}
