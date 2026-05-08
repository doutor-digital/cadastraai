// Server-only persistence for Kommo integration.
// Uses a JSON file under .data/ — simple, gitignored, sufficient for dev/single-tenant.
// For production multi-tenant, swap this for a real DB or persist via the C# backend.
import 'server-only'
import { promises as fs } from 'node:fs'
import path from 'node:path'

const DATA_DIR = path.resolve(process.cwd(), '.data')
const FILE = path.join(DATA_DIR, 'kommo.json')

export interface KommoConfig {
  subdomain: string
  accessToken: string
  webhookSecret?: string
  // Last successful sync timestamp (ISO).
  lastSyncAt?: string
}

export interface KommoInboxItem {
  id: string                  // our internal id
  kommoLeadId?: number        // Kommo's lead id when known
  source: 'webhook' | 'sync'
  receivedAt: string
  raw: unknown                // exact payload received
  status: 'pending' | 'imported' | 'discarded'
  importedLeadId?: string     // our system's lead id after promotion
  empresaId?: string          // empresa where it was imported
  note?: string
}

export interface KommoStoreShape {
  config: KommoConfig | null
  inbox: KommoInboxItem[]
}

const empty: KommoStoreShape = { config: null, inbox: [] }

async function ensureFile(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true })
  try {
    await fs.access(FILE)
  } catch {
    await fs.writeFile(FILE, JSON.stringify(empty, null, 2), 'utf-8')
  }
}

async function read(): Promise<KommoStoreShape> {
  await ensureFile()
  const raw = await fs.readFile(FILE, 'utf-8')
  try {
    const parsed = JSON.parse(raw) as KommoStoreShape
    return {
      config: parsed.config ?? null,
      inbox: parsed.inbox ?? [],
    }
  } catch {
    return { ...empty }
  }
}

async function write(state: KommoStoreShape): Promise<void> {
  await ensureFile()
  await fs.writeFile(FILE, JSON.stringify(state, null, 2), 'utf-8')
}

export async function getConfig(): Promise<KommoConfig | null> {
  return (await read()).config
}

export async function setConfig(cfg: KommoConfig | null): Promise<void> {
  const state = await read()
  state.config = cfg
  await write(state)
}

export async function listInbox(): Promise<KommoInboxItem[]> {
  return (await read()).inbox
}

export async function appendInbox(items: KommoInboxItem[]): Promise<void> {
  if (items.length === 0) return
  const state = await read()
  // Avoid duplicates by kommoLeadId+source.
  const existingKey = new Set(
    state.inbox.map((i) => `${i.source}:${i.kommoLeadId ?? i.id}`),
  )
  for (const item of items) {
    const key = `${item.source}:${item.kommoLeadId ?? item.id}`
    if (existingKey.has(key)) continue
    state.inbox.push(item)
    existingKey.add(key)
  }
  // Keep newest first.
  state.inbox.sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime())
  // Cap at 1000 to avoid unbounded growth.
  if (state.inbox.length > 1000) state.inbox.length = 1000
  await write(state)
}

export async function updateInboxItem(
  id: string,
  patch: Partial<KommoInboxItem>,
): Promise<KommoInboxItem | null> {
  const state = await read()
  const idx = state.inbox.findIndex((i) => i.id === id)
  if (idx === -1) return null
  state.inbox[idx] = { ...state.inbox[idx], ...patch }
  await write(state)
  return state.inbox[idx]
}

export async function deleteInboxItem(id: string): Promise<boolean> {
  const state = await read()
  const before = state.inbox.length
  state.inbox = state.inbox.filter((i) => i.id !== id)
  if (state.inbox.length === before) return false
  await write(state)
  return true
}

export async function clearInbox(): Promise<void> {
  const state = await read()
  state.inbox = []
  await write(state)
}

export async function recordSync(at: string): Promise<void> {
  const state = await read()
  if (state.config) {
    state.config = { ...state.config, lastSyncAt: at }
    await write(state)
  }
}
