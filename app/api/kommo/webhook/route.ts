import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import {
  appendInbox,
  getConfig,
  type KommoInboxItem,
} from '@/lib/kommo-store.server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Kommo sends webhooks as application/x-www-form-urlencoded with leads[add][0][id], etc.
// We accept either that or JSON for flexibility.
function parseFormToObject(form: FormData): Record<string, unknown> {
  // Group "leads[add][0][id]" => leads.add[0].id
  const out: Record<string, unknown> = {}
  for (const [key, value] of form.entries()) {
    const path = key
      .replace(/\]/g, '')
      .split(/[[]/g)
      .filter(Boolean)
    let cursor = out
    for (let i = 0; i < path.length - 1; i++) {
      const seg = path[i]
      const next = path[i + 1]
      const nextIsIndex = /^\d+$/.test(next)
      if (cursor[seg] == null) cursor[seg] = nextIsIndex ? [] : {}
      cursor = cursor[seg] as Record<string, unknown>
    }
    const last = path[path.length - 1]
    cursor[last] = typeof value === 'string' ? value : value.name
  }
  return out
}

export async function POST(req: NextRequest) {
  const cfg = await getConfig()
  // Optional shared-secret check via ?secret= query param.
  if (cfg?.webhookSecret) {
    const provided = req.nextUrl.searchParams.get('secret')
    if (provided !== cfg.webhookSecret) {
      return NextResponse.json({ error: 'invalid secret' }, { status: 401 })
    }
  }

  const contentType = req.headers.get('content-type') ?? ''
  let payload: unknown
  if (contentType.includes('application/json')) {
    payload = await req.json().catch(() => null)
  } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
    const form = await req.formData()
    payload = parseFormToObject(form)
  } else {
    payload = await req.text().catch(() => '')
  }

  if (!payload) {
    return NextResponse.json({ error: 'payload vazio' }, { status: 400 })
  }

  // Best-effort: extract individual lead ids from the payload structure.
  const items: KommoInboxItem[] = []
  const now = new Date().toISOString()

  // Common shapes:
  //   { leads: { add: [{ id, name, ... }], update: [...], status: [...] } }
  const root = payload as { leads?: Record<string, unknown[]> } & Record<string, unknown>
  const leadGroups = root.leads ?? null
  if (leadGroups && typeof leadGroups === 'object') {
    for (const arr of Object.values(leadGroups)) {
      if (!Array.isArray(arr)) continue
      for (const entry of arr) {
        const id = Number((entry as { id?: unknown })?.id ?? NaN)
        items.push({
          id: randomUUID(),
          kommoLeadId: Number.isFinite(id) ? id : undefined,
          source: 'webhook',
          receivedAt: now,
          raw: entry,
          status: 'pending',
        })
      }
    }
  }

  // If we couldn't extract structured leads, store the raw payload as one entry so nothing's lost.
  if (items.length === 0) {
    items.push({
      id: randomUUID(),
      source: 'webhook',
      receivedAt: now,
      raw: payload,
      status: 'pending',
      note: 'Payload não reconhecido — armazenado para inspeção manual.',
    })
  }

  await appendInbox(items)
  return NextResponse.json({ ok: true, stored: items.length })
}

export async function GET() {
  // Simple health probe — Kommo's webhook UI sends a test ping you can confirm here.
  return NextResponse.json({ ok: true, service: 'cadastraai/kommo-webhook' })
}
