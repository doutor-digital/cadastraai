import { NextRequest, NextResponse } from 'next/server'
import { getConfig, setConfig, type KommoConfig } from '@/lib/kommo-store.server'
import { ping } from '@/lib/kommo-client.server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Token is sensitive — never echo it back. Only return its presence + a short suffix.
function redact(cfg: KommoConfig | null) {
  if (!cfg) return null
  const tail = cfg.accessToken.slice(-4)
  return {
    subdomain: cfg.subdomain,
    hasToken: cfg.accessToken.length > 0,
    tokenSuffix: tail,
    webhookSecret: cfg.webhookSecret ? '***' : '',
    lastSyncAt: cfg.lastSyncAt ?? null,
  }
}

export async function GET() {
  const cfg = await getConfig()
  return NextResponse.json({ config: redact(cfg) })
}

export async function PUT(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as Partial<KommoConfig> | null
  if (!body || !body.subdomain || !body.accessToken) {
    return NextResponse.json({ error: 'subdomain e accessToken são obrigatórios.' }, { status: 400 })
  }

  // Validate by hitting Kommo's /api/v4/account.
  const probe = await ping(body.subdomain, body.accessToken)
  if (!probe.ok) {
    return NextResponse.json(
      { error: `Falha ao autenticar na Kommo: ${probe.error}` },
      { status: 400 },
    )
  }

  await setConfig({
    subdomain: body.subdomain,
    accessToken: body.accessToken,
    webhookSecret: body.webhookSecret ?? '',
  })
  return NextResponse.json({ config: redact(await getConfig()), account: probe.account })
}

export async function DELETE() {
  await setConfig(null)
  return NextResponse.json({ ok: true })
}
