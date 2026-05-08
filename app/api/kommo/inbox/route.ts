import { NextResponse } from 'next/server'
import { clearInbox, listInbox } from '@/lib/kommo-store.server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const items = await listInbox()
  return NextResponse.json({ items })
}

// Clear the entire inbox (used by the "Limpar" button on the front).
export async function DELETE() {
  await clearInbox()
  return NextResponse.json({ ok: true })
}
