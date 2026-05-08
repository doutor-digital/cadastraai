import { NextRequest, NextResponse } from 'next/server'
import { deleteInboxItem, updateInboxItem } from '@/lib/kommo-store.server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params
  const body = await req.json().catch(() => ({}))
  const allowed: Record<string, unknown> = {}
  if (body.status === 'pending' || body.status === 'imported' || body.status === 'discarded') {
    allowed.status = body.status
  }
  if (typeof body.importedLeadId === 'string') allowed.importedLeadId = body.importedLeadId
  if (typeof body.empresaId === 'string') allowed.empresaId = body.empresaId
  if (typeof body.note === 'string') allowed.note = body.note

  const updated = await updateInboxItem(id, allowed)
  if (!updated) return NextResponse.json({ error: 'não encontrado' }, { status: 404 })
  return NextResponse.json({ item: updated })
}

export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params
  const ok = await deleteInboxItem(id)
  return NextResponse.json({ ok }, { status: ok ? 200 : 404 })
}
