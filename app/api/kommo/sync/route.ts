import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { appendInbox, getConfig, recordSync, type KommoInboxItem } from '@/lib/kommo-store.server'
import { fetchLeadsWithContacts } from '@/lib/kommo-client.server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const cfg = await getConfig()
  if (!cfg) {
    return NextResponse.json(
      { error: 'Kommo não configurado. Salve subdomínio + token primeiro.' },
      { status: 412 },
    )
  }

  const body = (await req.json().catch(() => ({}))) as { limit?: number; page?: number; query?: string }
  const limit = Math.min(Math.max(Number(body.limit ?? 50), 1), 250)
  const page = Math.max(Number(body.page ?? 1), 1)

  try {
    const records = await fetchLeadsWithContacts(cfg.subdomain, cfg.accessToken, {
      limit,
      page,
      query: body.query,
    })

    const items: KommoInboxItem[] = records.map(({ lead, contact }) => ({
      id: randomUUID(),
      kommoLeadId: lead.id,
      source: 'sync',
      receivedAt: new Date().toISOString(),
      raw: { lead, contact },
      status: 'pending',
    }))

    await appendInbox(items)
    const now = new Date().toISOString()
    await recordSync(now)

    return NextResponse.json({
      received: records.length,
      stored: items.length,
      lastSyncAt: now,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro inesperado durante sync.' },
      { status: 502 },
    )
  }
}
