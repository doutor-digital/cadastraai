'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Plug,
  Plug2,
  Inbox,
  RefreshCw,
  Webhook,
  Copy,
  Check,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Trash2,
  Sparkles,
  Search,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Eye,
  EyeOff,
  Save,
  Building2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { empresasApi, leadsApi, type CreateLeadPayload, type EmpresaDto } from '@/lib/api'
import {
  analyzeKommoLead,
  listTargets,
  type AnalyzeResult,
  type TargetField,
} from '@/lib/kommo-mapping'

interface KommoViewProps {
  onBack: () => void
}

interface PublicConfig {
  subdomain: string
  hasToken: boolean
  tokenSuffix: string
  webhookSecret: string
  lastSyncAt: string | null
}

interface InboxItemDto {
  id: string
  kommoLeadId?: number
  source: 'webhook' | 'sync'
  receivedAt: string
  raw: unknown
  status: 'pending' | 'imported' | 'discarded'
  importedLeadId?: string
  empresaId?: string
  note?: string
}

type Tab = 'config' | 'inbox' | 'sync'

const TARGETS = listTargets()

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function KommoView({ onBack }: KommoViewProps) {
  const [tab, setTab] = useState<Tab>('config')
  const [config, setConfig] = useState<PublicConfig | null>(null)
  const [configLoading, setConfigLoading] = useState(true)
  const [inbox, setInbox] = useState<InboxItemDto[]>([])
  const [inboxLoading, setInboxLoading] = useState(false)
  const [empresas, setEmpresas] = useState<EmpresaDto[]>([])
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error' | 'info'; msg: string } | null>(null)

  useEffect(() => {
    refreshConfig()
    refreshInbox()
    empresasApi
      .list()
      .then(setEmpresas)
      .catch(() => {})
  }, [])

  async function refreshConfig() {
    setConfigLoading(true)
    try {
      const r = await fetch('/api/kommo/config', { cache: 'no-store' })
      const j = (await r.json()) as { config: PublicConfig | null }
      setConfig(j.config)
    } finally {
      setConfigLoading(false)
    }
  }

  async function refreshInbox() {
    setInboxLoading(true)
    try {
      const r = await fetch('/api/kommo/inbox', { cache: 'no-store' })
      const j = (await r.json()) as { items: InboxItemDto[] }
      setInbox(j.items)
    } finally {
      setInboxLoading(false)
    }
  }

  return (
    <motion.div
      className="px-8 py-8 max-w-6xl mx-auto"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <button
          onClick={onBack}
          className="group inline-flex items-center gap-2 px-3 h-9 rounded-xl bg-[#15171b] border border-white/5 text-[13px] text-white/70 hover:text-white hover:border-white/12 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Voltar para Dashboard
        </button>
      </div>

      {/* Hero */}
      <div
        className="rounded-3xl p-7 mb-5 text-cyan-50"
        style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0e7490 60%, #075985 100%)' }}
      >
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-white/15 grid place-items-center">
            <Plug2 className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-[12px] uppercase tracking-[0.2em] text-cyan-100/85 mb-1">Integração</p>
            <h1 className="text-[28px] font-bold tracking-tight leading-none">Kommo CRM</h1>
            <p className="text-[13px] text-cyan-100/85 mt-2">
              Receba leads via webhook ou faça sync manual. O sistema detecta os campos
              automaticamente e mostra o que falta antes de promover para o seu funil.
            </p>
          </div>
          <ConfigStatusPill loading={configLoading} config={config} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-5 border-b border-white/5">
        <TabButton active={tab === 'config'} onClick={() => setTab('config')}>
          <Plug className="h-4 w-4" /> Configuração
        </TabButton>
        <TabButton active={tab === 'inbox'} onClick={() => setTab('inbox')}>
          <Inbox className="h-4 w-4" /> Inbox
          {inbox.filter((i) => i.status === 'pending').length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-200 font-bold tabular-nums">
              {inbox.filter((i) => i.status === 'pending').length}
            </span>
          )}
        </TabButton>
        <TabButton active={tab === 'sync'} onClick={() => setTab('sync')}>
          <RefreshCw className="h-4 w-4" /> Sincronização
        </TabButton>
      </div>

      {feedback && (
        <FeedbackBanner feedback={feedback} onClose={() => setFeedback(null)} />
      )}

      {tab === 'config' && (
        <ConfigTab config={config} onSaved={(msg) => { refreshConfig(); setFeedback({ kind: 'success', msg }) }} onError={(msg) => setFeedback({ kind: 'error', msg })} />
      )}

      {tab === 'sync' && (
        <SyncTab
          configured={!!config}
          onResult={(res) => {
            setFeedback(res)
            refreshInbox()
            refreshConfig()
          }}
        />
      )}

      {tab === 'inbox' && (
        <InboxTab
          items={inbox}
          loading={inboxLoading}
          empresas={empresas}
          onRefresh={refreshInbox}
          onFeedback={setFeedback}
        />
      )}
    </motion.div>
  )
}

function ConfigStatusPill({ loading, config }: { loading: boolean; config: PublicConfig | null }) {
  if (loading) return null
  if (!config || !config.hasToken) {
    return (
      <span className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full bg-white/15 text-white text-[11px] uppercase tracking-wider font-bold">
        <XCircle className="h-3.5 w-3.5" />
        Não configurado
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full bg-emerald-500/30 border border-emerald-300/40 text-white text-[11px] uppercase tracking-wider font-bold">
      <CheckCircle2 className="h-3.5 w-3.5" />
      Conectado
    </span>
  )
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 px-4 h-10 rounded-t-xl text-[13px] font-semibold border-b-2 transition-colors',
        active
          ? 'border-cyan-400 text-white bg-white/[0.04]'
          : 'border-transparent text-white/55 hover:text-white hover:bg-white/[0.02]',
      )}
    >
      {children}
    </button>
  )
}

function FeedbackBanner({
  feedback,
  onClose,
}: {
  feedback: { kind: 'success' | 'error' | 'info'; msg: string }
  onClose: () => void
}) {
  const palette =
    feedback.kind === 'success'
      ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200'
      : feedback.kind === 'error'
        ? 'border-red-400/30 bg-red-500/10 text-red-200'
        : 'border-cyan-400/30 bg-cyan-500/10 text-cyan-200'
  const Icon = feedback.kind === 'success' ? CheckCircle2 : feedback.kind === 'error' ? AlertCircle : AlertCircle
  return (
    <div className={cn('rounded-2xl border px-4 py-3 mb-5 flex items-start gap-3', palette)}>
      <Icon className="h-5 w-5 shrink-0 mt-0.5" />
      <p className="flex-1 text-[13px]">{feedback.msg}</p>
      <button onClick={onClose} className="text-current/60 hover:text-current text-[12px]">
        <XCircle className="h-4 w-4" />
      </button>
    </div>
  )
}

// ----- CONFIG TAB -----

function ConfigTab({
  config,
  onSaved,
  onError,
}: {
  config: PublicConfig | null
  onSaved: (msg: string) => void
  onError: (msg: string) => void
}) {
  const [subdomain, setSubdomain] = useState('')
  const [token, setToken] = useState('')
  const [secret, setSecret] = useState('')
  const [showToken, setShowToken] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [copied, setCopied] = useState<'webhook' | null>(null)

  useEffect(() => {
    if (config) setSubdomain(config.subdomain)
  }, [config])

  const webhookUrl = useMemo(() => {
    if (typeof window === 'undefined') return ''
    const base = window.location.origin
    const secretQs = config?.webhookSecret ? `?secret=${encodeURIComponent(config.webhookSecret)}` : ''
    return `${base}/api/kommo/webhook${secretQs}`
  }, [config?.webhookSecret])

  async function save() {
    if (!subdomain || !token) {
      onError('Preencha o subdomínio e o access token.')
      return
    }
    setSaving(true)
    try {
      const r = await fetch('/api/kommo/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subdomain, accessToken: token, webhookSecret: secret || undefined }),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || 'Falha ao salvar.')
      setToken('')
      onSaved(`Conectado ao Kommo${j.account?.name ? ` — ${j.account.name}` : ''}.`)
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Erro inesperado.')
    } finally {
      setSaving(false)
    }
  }

  async function disconnect() {
    if (!confirm('Remover a configuração da Kommo?')) return
    setSaving(true)
    try {
      await fetch('/api/kommo/config', { method: 'DELETE' })
      setToken('')
      setSubdomain('')
      onSaved('Desconectado.')
    } finally {
      setSaving(false)
    }
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied('webhook')
      setTimeout(() => setCopied(null), 1500)
    } catch {
      // ignore
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Credenciais */}
      <div className="rounded-3xl border border-white/5 bg-[#15171b] p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-400/30 grid place-items-center">
            <Plug className="h-5 w-5 text-cyan-300" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-white">Credenciais Kommo</h3>
            <p className="text-[12px] text-white/55">Subdomínio + access token de longa duração.</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-white/45 font-semibold">Subdomínio</label>
            <div className="mt-1 flex items-center rounded-xl border border-white/10 bg-[#0c0d10] focus-within:border-cyan-400/50">
              <input
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value)}
                placeholder="minha-conta"
                className="flex-1 h-10 px-3 bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none"
              />
              <span className="px-3 text-[12px] text-white/45 border-l border-white/10">.kommo.com</span>
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-white/45 font-semibold">Access token</label>
            <div className="mt-1 flex items-center rounded-xl border border-white/10 bg-[#0c0d10] focus-within:border-cyan-400/50">
              <input
                type={showToken ? 'text' : 'password'}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder={config?.hasToken ? `••••••••${config.tokenSuffix}` : 'Cole o token longo aqui'}
                className="flex-1 h-10 px-3 bg-transparent text-sm font-mono text-white placeholder:text-white/35 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowToken((v) => !v)}
                className="px-3 text-white/55 hover:text-white"
              >
                {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-[11px] text-white/45 mt-1">
              Crie em Configurações → Integrações → Long-Lived Token na Kommo. O token é
              armazenado apenas no servidor (não trafega para o navegador).
            </p>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-white/45 font-semibold">Webhook secret (opcional)</label>
            <input
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Use um valor secreto p/ proteger o endpoint"
              className="mt-1 w-full h-10 px-3 rounded-xl bg-[#0c0d10] border border-white/10 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-cyan-400/50"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={save}
              disabled={saving || (!token && !config?.hasToken)}
              className="inline-flex items-center gap-2 px-5 h-10 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#0d0f14] text-[13px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Salvando…' : 'Salvar e validar'}
            </button>
            {config?.hasToken && (
              <button
                onClick={disconnect}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 h-10 rounded-xl border border-rose-400/30 bg-rose-500/[0.06] text-rose-300 text-[13px] hover:bg-rose-500/15 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Desconectar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Webhook */}
      <div className="rounded-3xl border border-white/5 bg-[#15171b] p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-violet-500/10 border border-violet-400/30 grid place-items-center">
            <Webhook className="h-5 w-5 text-violet-300" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-white">Webhook (push)</h3>
            <p className="text-[12px] text-white/55">Cole esta URL na Kommo para receber leads em tempo real.</p>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0c0d10] p-3 flex items-center gap-2 mb-3">
          <code className="flex-1 text-[12px] font-mono text-cyan-200 truncate">{webhookUrl || 'carregando…'}</code>
          <button
            onClick={() => webhookUrl && copy(webhookUrl)}
            className="h-8 w-8 grid place-items-center rounded-lg hover:bg-white/[0.06] text-white/70 hover:text-white transition-colors"
          >
            {copied === 'webhook' ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>

        <div className="space-y-2 text-[12px] text-white/65">
          <p className="font-semibold text-white/85">Como configurar na Kommo:</p>
          <ol className="list-decimal list-inside space-y-1 pl-1">
            <li>Vá em <strong>Configurações → Integrações → Webhooks</strong>.</li>
            <li>Adicione um novo webhook com a URL acima.</li>
            <li>Marque os eventos <em>Lead criado</em> e <em>Lead atualizado</em>.</li>
            <li>Salve. Os leads aparecerão na aba Inbox automaticamente.</li>
          </ol>
          <a
            href="https://www.kommo.com/developers/content/digital_pipeline/webhooks/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-cyan-300 hover:text-cyan-200 mt-2"
          >
            Documentação Kommo <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  )
}

// ----- SYNC TAB -----

function SyncTab({
  configured,
  onResult,
}: {
  configured: boolean
  onResult: (res: { kind: 'success' | 'error'; msg: string }) => void
}) {
  const [running, setRunning] = useState(false)
  const [limit, setLimit] = useState(50)
  const [query, setQuery] = useState('')

  async function run() {
    setRunning(true)
    try {
      const r = await fetch('/api/kommo/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit, query: query || undefined }),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || 'Falha no sync.')
      onResult({ kind: 'success', msg: `Sync concluído: ${j.received} leads recebidos, ${j.stored} novos na inbox.` })
    } catch (err) {
      onResult({ kind: 'error', msg: err instanceof Error ? err.message : 'Erro desconhecido.' })
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="rounded-3xl border border-white/5 bg-[#15171b] p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-400/30 grid place-items-center">
          <RefreshCw className="h-5 w-5 text-amber-300" />
        </div>
        <div>
          <h3 className="text-[15px] font-bold text-white">Sincronização manual (pull)</h3>
          <p className="text-[12px] text-white/55">Busca leads diretamente da Kommo via /api/v4/leads.</p>
        </div>
      </div>

      {!configured && (
        <div className="rounded-xl border border-amber-400/30 bg-amber-500/[0.05] px-4 py-3 mb-4 flex items-start gap-3">
          <AlertCircle className="h-4 w-4 text-amber-300 shrink-0 mt-0.5" />
          <p className="text-[12px] text-amber-100/90">
            Configure as credenciais na aba <strong>Configuração</strong> antes de sincronizar.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-[10px] uppercase tracking-wider text-white/45 font-semibold">Quantidade</label>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="mt-1 w-full h-10 px-3 rounded-xl bg-[#0c0d10] border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-400/50"
          >
            <option value={10}>10 leads</option>
            <option value={50}>50 leads</option>
            <option value={100}>100 leads</option>
            <option value={250}>250 leads</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="text-[10px] uppercase tracking-wider text-white/45 font-semibold">Filtro (opcional)</label>
          <div className="mt-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pesquisar por nome ou telefone na Kommo…"
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#0c0d10] border border-white/10 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-cyan-400/50"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <button
          onClick={run}
          disabled={!configured || running}
          className="inline-flex items-center gap-2 px-5 h-11 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#0d0f14] text-[13px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={cn('h-4 w-4', running && 'animate-spin')} />
          {running ? 'Sincronizando…' : 'Sincronizar agora'}
        </button>
      </div>
    </div>
  )
}

// ----- INBOX TAB -----

function InboxTab({
  items,
  loading,
  empresas,
  onRefresh,
  onFeedback,
}: {
  items: InboxItemDto[]
  loading: boolean
  empresas: EmpresaDto[]
  onRefresh: () => void
  onFeedback: (f: { kind: 'success' | 'error' | 'info'; msg: string }) => void
}) {
  const [statusFilter, setStatusFilter] = useState<'todos' | 'pending' | 'imported' | 'discarded'>('pending')
  const [expanded, setExpanded] = useState<string | null>(null)

  const filtered = useMemo(
    () => (statusFilter === 'todos' ? items : items.filter((i) => i.status === statusFilter)),
    [items, statusFilter],
  )

  async function clearAll() {
    if (!confirm('Apagar todos os itens da inbox? (não afeta leads já importados)')) return
    await fetch('/api/kommo/inbox', { method: 'DELETE' })
    onRefresh()
    onFeedback({ kind: 'info', msg: 'Inbox limpa.' })
  }

  if (loading && items.length === 0) {
    return (
      <div className="rounded-3xl border border-white/5 bg-[#15171b] p-6">
        <p className="text-white/55 text-sm">Carregando inbox…</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-white/10 px-6 py-16 text-center">
        <Inbox className="h-7 w-7 text-white/30 mx-auto mb-3" />
        <p className="text-[15px] font-semibold text-white/85 mb-1">Inbox vazia</p>
        <p className="text-[13px] text-white/55">
          Configure o webhook ou faça uma sincronização para começar a receber leads da Kommo.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex gap-2">
          {(['pending', 'imported', 'discarded', 'todos'] as const).map((s) => {
            const count = s === 'todos' ? items.length : items.filter((i) => i.status === s).length
            const label = s === 'pending' ? 'Pendentes' : s === 'imported' ? 'Importados' : s === 'discarded' ? 'Descartados' : 'Todos'
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  'inline-flex items-center gap-2 h-9 px-3 rounded-xl border text-[12px] transition-colors',
                  statusFilter === s
                    ? 'bg-cyan-500/15 text-cyan-200 border-cyan-400/40'
                    : 'bg-[#0c0d10] text-white/55 border-white/10 hover:text-white hover:border-white/20',
                )}
              >
                <span className="font-semibold">{label}</span>
                <span className="text-[11px] tabular-nums opacity-80">{count}</span>
              </button>
            )
          })}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 h-9 rounded-xl border border-white/10 bg-white/[0.03] text-[13px] text-white/70 hover:text-white hover:border-white/20 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            Atualizar
          </button>
          <button
            onClick={clearAll}
            className="inline-flex items-center gap-2 px-3 h-9 rounded-xl border border-rose-400/30 bg-rose-500/[0.06] text-rose-300 text-[13px] hover:bg-rose-500/15 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Limpar inbox
          </button>
        </div>
      </div>

      <ul className="space-y-3">
        {filtered.map((item) => (
          <InboxRow
            key={item.id}
            item={item}
            expanded={expanded === item.id}
            onToggle={() => setExpanded((cur) => (cur === item.id ? null : item.id))}
            empresas={empresas}
            onChanged={onRefresh}
            onFeedback={onFeedback}
          />
        ))}
      </ul>
    </div>
  )
}

function InboxRow({
  item,
  expanded,
  onToggle,
  empresas,
  onChanged,
  onFeedback,
}: {
  item: InboxItemDto
  expanded: boolean
  onToggle: () => void
  empresas: EmpresaDto[]
  onChanged: () => void
  onFeedback: (f: { kind: 'success' | 'error' | 'info'; msg: string }) => void
}) {
  const analysis = useMemo<AnalyzeResult | null>(() => {
    try {
      const raw = item.raw as { lead?: unknown; contact?: unknown } | null
      if (raw && typeof raw === 'object' && raw.lead) {
        return analyzeKommoLead({
          lead: raw.lead as Parameters<typeof analyzeKommoLead>[0]['lead'],
          contact: (raw.contact as Parameters<typeof analyzeKommoLead>[0]['contact']) ?? null,
        })
      }
      // Webhook payloads with bare {id, name} get a best-effort analysis too.
      if (raw && typeof raw === 'object') {
        return analyzeKommoLead({
          lead: raw as Parameters<typeof analyzeKommoLead>[0]['lead'],
          contact: null,
        })
      }
    } catch {
      // ignore — analysis just won't show.
    }
    return null
  }, [item.raw])

  const completeness = analysis?.completeness ?? 0
  const ready = analysis ? analysis.missingRequired.length === 0 : false

  return (
    <li className="rounded-2xl border border-white/5 bg-[#15171b] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-4 py-3 hover:bg-white/[0.02] transition-colors text-left"
      >
        <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-400/30 grid place-items-center shrink-0">
          {item.source === 'webhook' ? <Webhook className="h-4 w-4 text-cyan-300" /> : <RefreshCw className="h-4 w-4 text-cyan-300" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-[14px] font-semibold text-white truncate">
              {analysis?.displayName ?? `Item #${item.id.slice(0, 8)}`}
            </p>
            <StatusBadge status={item.status} />
            {item.kommoLeadId != null && (
              <span className="text-[10px] uppercase tracking-wider font-bold text-white/45 bg-white/[0.04] border border-white/10 px-1.5 py-0.5 rounded-md">
                Kommo #{item.kommoLeadId}
              </span>
            )}
          </div>
          <p className="text-[12px] text-white/55 truncate">
            {item.source === 'webhook' ? 'Recebido por webhook' : 'Recebido por sync'} · {formatDateTime(item.receivedAt)}
            {item.note ? ` · ${item.note}` : ''}
          </p>
        </div>
        {analysis && (
          <div className="hidden sm:flex flex-col items-end gap-1 mr-2">
            <CompletenessBar value={completeness} />
            <span className="text-[10px] text-white/45">{completeness}% mapeado</span>
          </div>
        )}
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-white/45 shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-white/45 shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-white/5 p-4">
          {analysis ? (
            <GapAnalysisPanel
              item={item}
              analysis={analysis}
              ready={ready}
              empresas={empresas}
              onChanged={onChanged}
              onFeedback={onFeedback}
            />
          ) : (
            <RawPayloadPanel item={item} onChanged={onChanged} onFeedback={onFeedback} />
          )}
        </div>
      )}
    </li>
  )
}

function StatusBadge({ status }: { status: InboxItemDto['status'] }) {
  if (status === 'imported') {
    return (
      <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-400/30 px-1.5 py-0.5 rounded-md inline-flex items-center gap-1">
        <CheckCircle2 className="h-3 w-3" /> Importado
      </span>
    )
  }
  if (status === 'discarded') {
    return (
      <span className="text-[10px] uppercase tracking-wider font-bold text-white/55 bg-white/[0.04] border border-white/10 px-1.5 py-0.5 rounded-md inline-flex items-center gap-1">
        <XCircle className="h-3 w-3" /> Descartado
      </span>
    )
  }
  return (
    <span className="text-[10px] uppercase tracking-wider font-bold text-cyan-200 bg-cyan-500/10 border border-cyan-400/30 px-1.5 py-0.5 rounded-md inline-flex items-center gap-1">
      <Sparkles className="h-3 w-3" /> Pendente
    </span>
  )
}

function CompletenessBar({ value }: { value: number }) {
  const color = value >= 80 ? 'bg-emerald-400' : value >= 50 ? 'bg-amber-300' : 'bg-rose-400'
  return (
    <div className="h-1.5 w-32 rounded-full bg-white/[0.06] overflow-hidden">
      <div className={cn('h-full transition-all', color)} style={{ width: `${value}%` }} />
    </div>
  )
}

// ----- Gap Analysis -----

function GapAnalysisPanel({
  item,
  analysis,
  ready,
  empresas,
  onChanged,
  onFeedback,
}: {
  item: InboxItemDto
  analysis: AnalyzeResult
  ready: boolean
  empresas: EmpresaDto[]
  onChanged: () => void
  onFeedback: (f: { kind: 'success' | 'error' | 'info'; msg: string }) => void
}) {
  const [overrides, setOverrides] = useState<Partial<Record<TargetField, unknown>>>({})
  const [empresaId, setEmpresaId] = useState<string>(empresas[0]?.id ?? '')
  const [importing, setImporting] = useState(false)

  useEffect(() => {
    if (!empresaId && empresas[0]) setEmpresaId(empresas[0].id)
  }, [empresas, empresaId])

  // Effective payload = suggested + overrides
  const effective: Partial<CreateLeadPayload> = useMemo(() => {
    return { ...analysis.suggestedPayload, ...overrides } as Partial<CreateLeadPayload>
  }, [analysis.suggestedPayload, overrides])

  const stillMissingRequired = useMemo(() => {
    return TARGETS.filter(
      (t) =>
        t.required &&
        ((effective as Record<string, unknown>)[t.field] == null ||
          (effective as Record<string, unknown>)[t.field] === ''),
    )
  }, [effective])

  const canImport = stillMissingRequired.length === 0 && empresaId && item.status === 'pending'

  async function importNow() {
    if (!canImport) return
    setImporting(true)
    try {
      const payload: CreateLeadPayload = {
        nome: String(effective.nome ?? ''),
        telefone: String(effective.telefone ?? ''),
        origem: String(effective.origem ?? 'Kommo'),
        tipo: (effective.tipo === 'Resgate' ? 'Resgate' : 'Cadastro'),
        tipoResgate: effective.tipoResgate ? String(effective.tipoResgate) : undefined,
        interacao: !!effective.interacao,
        agendouConsulta: !!effective.agendouConsulta,
        pagamentoAntecipado: !!effective.pagamentoAntecipado,
        dataAgendamento: effective.dataAgendamento ? String(effective.dataAgendamento) : undefined,
        motivoNaoAgendamento: effective.motivoNaoAgendamento ? String(effective.motivoNaoAgendamento) : undefined,
        nomeResponsavel: String(effective.nomeResponsavel ?? '—'),
      }
      const created = await leadsApi.create(empresaId, payload)
      await fetch(`/api/kommo/inbox/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'imported', importedLeadId: created.id, empresaId }),
      })
      onFeedback({ kind: 'success', msg: `Lead "${created.nome}" criado no sistema.` })
      onChanged()
    } catch (err) {
      onFeedback({ kind: 'error', msg: err instanceof Error ? err.message : 'Falha ao importar.' })
    } finally {
      setImporting(false)
    }
  }

  async function discard() {
    await fetch(`/api/kommo/inbox/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'discarded' }),
    })
    onFeedback({ kind: 'info', msg: 'Item marcado como descartado.' })
    onChanged()
  }

  async function remove() {
    if (!confirm('Remover este item da inbox?')) return
    await fetch(`/api/kommo/inbox/${item.id}`, { method: 'DELETE' })
    onChanged()
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[12px]">
        <Stat
          label="Mapeados"
          value={`${analysis.matches.size}/${TARGETS.length}`}
          tone="ok"
        />
        <Stat
          label="Faltando obrigatórios"
          value={stillMissingRequired.length}
          tone={stillMissingRequired.length === 0 ? 'ok' : 'warn'}
        />
        <Stat
          label="Completude"
          value={`${analysis.completeness}%`}
          tone={analysis.completeness >= 80 ? 'ok' : analysis.completeness >= 50 ? 'warn' : 'err'}
        />
      </div>

      {/* Lista de campos */}
      <div className="rounded-2xl border border-white/5 bg-[#0c0d10] divide-y divide-white/5">
        {TARGETS.map((t) => {
          const match = analysis.matches.get(t.field)
          const overriden = overrides[t.field] !== undefined
          const value = (effective as Record<string, unknown>)[t.field]
          const filled = value != null && value !== ''
          const isMissingRequired = t.required && !filled
          return (
            <div key={t.field} className="px-4 py-3 flex items-start gap-3">
              <div
                className={cn(
                  'h-7 w-7 grid place-items-center rounded-lg shrink-0 border',
                  filled
                    ? match
                      ? match.confidence >= 0.8
                        ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-300'
                        : 'bg-amber-500/10 border-amber-400/30 text-amber-300'
                      : 'bg-cyan-500/10 border-cyan-400/30 text-cyan-300'
                    : isMissingRequired
                      ? 'bg-rose-500/10 border-rose-400/30 text-rose-300'
                      : 'bg-white/[0.03] border-white/10 text-white/45',
                )}
              >
                {filled ? <Check className="h-3.5 w-3.5" /> : isMissingRequired ? <XCircle className="h-3.5 w-3.5" /> : <span className="text-[10px]">·</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-[13px] font-semibold text-white">{t.label}</p>
                  {t.required && (
                    <span className="text-[9px] uppercase tracking-wider font-bold text-rose-300 bg-rose-500/10 border border-rose-400/20 px-1.5 py-0.5 rounded">
                      obrigatório
                    </span>
                  )}
                  {match && (
                    <span className="text-[10px] text-white/45 font-mono">
                      detectado em <span className="text-cyan-300">{match.source}{match.rawKey ? `.${match.rawKey}` : ''}</span> ({Math.round(match.confidence * 100)}%)
                    </span>
                  )}
                  {overriden && (
                    <span className="text-[9px] uppercase tracking-wider font-bold text-violet-300 bg-violet-500/10 border border-violet-400/20 px-1.5 py-0.5 rounded">
                      manual
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-white/45 mb-1">{t.hint}</p>
                <FieldEditor
                  field={t.field}
                  value={value}
                  onChange={(v) => setOverrides((prev) => ({ ...prev, [t.field]: v }))}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Ação final */}
      <div className="rounded-2xl border border-white/5 bg-[#0c0d10] p-4 flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <Building2 className="h-4 w-4 text-white/55" />
          <select
            value={empresaId}
            onChange={(e) => setEmpresaId(e.target.value)}
            className="h-9 px-3 rounded-xl bg-[#15171b] border border-white/10 text-[13px] text-white focus:outline-none focus:border-cyan-400/50"
          >
            {empresas.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nome}
              </option>
            ))}
          </select>
          {!ready && (
            <span className="text-[11px] text-amber-300">
              {stillMissingRequired.length} campo(s) obrigatório(s) ainda em branco — preencha acima.
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {item.status === 'pending' && (
            <button
              onClick={discard}
              className="inline-flex items-center gap-2 px-3 h-9 rounded-xl border border-white/10 bg-white/[0.03] text-[12px] text-white/65 hover:text-white hover:border-white/20 transition-colors"
            >
              Descartar
            </button>
          )}
          <button
            onClick={remove}
            className="inline-flex items-center gap-2 px-3 h-9 rounded-xl border border-rose-400/30 bg-rose-500/[0.06] text-rose-300 text-[12px] hover:bg-rose-500/15 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remover
          </button>
          <button
            onClick={importNow}
            disabled={!canImport || importing}
            className="inline-flex items-center gap-2 px-5 h-9 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#0d0f14] text-[13px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            {importing ? 'Importando…' : 'Promover para lead'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, tone }: { label: string; value: number | string; tone: 'ok' | 'warn' | 'err' }) {
  const palette = tone === 'ok'
    ? 'border-emerald-400/30 bg-emerald-500/[0.06] text-emerald-200'
    : tone === 'warn'
      ? 'border-amber-400/30 bg-amber-500/[0.06] text-amber-200'
      : 'border-rose-400/30 bg-rose-500/[0.06] text-rose-200'
  return (
    <div className={cn('rounded-xl border px-4 py-3', palette)}>
      <p className="text-[10px] uppercase tracking-wider opacity-80 font-semibold">{label}</p>
      <p className="text-[20px] font-bold tabular-nums">{value}</p>
    </div>
  )
}

function FieldEditor({
  field,
  value,
  onChange,
}: {
  field: TargetField
  value: unknown
  onChange: (v: unknown) => void
}) {
  if (field === 'interacao' || field === 'agendouConsulta' || field === 'pagamentoAntecipado') {
    const v = !!value
    return (
      <div className="flex items-center gap-2 mt-1">
        <button
          onClick={() => onChange(true)}
          className={cn(
            'h-8 px-3 rounded-lg text-[12px] border transition-colors',
            v ? 'bg-emerald-500/15 text-emerald-200 border-emerald-400/30' : 'bg-white/[0.03] text-white/55 border-white/10 hover:text-white',
          )}
        >
          Sim
        </button>
        <button
          onClick={() => onChange(false)}
          className={cn(
            'h-8 px-3 rounded-lg text-[12px] border transition-colors',
            !v ? 'bg-rose-500/15 text-rose-200 border-rose-400/30' : 'bg-white/[0.03] text-white/55 border-white/10 hover:text-white',
          )}
        >
          Não
        </button>
      </div>
    )
  }
  if (field === 'tipo') {
    const v = value === 'Resgate' ? 'Resgate' : 'Cadastro'
    return (
      <select
        value={v}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 h-9 px-3 rounded-lg bg-[#15171b] border border-white/10 text-[12px] text-white focus:outline-none focus:border-cyan-400/50"
      >
        <option value="Cadastro">Cadastro</option>
        <option value="Resgate">Resgate</option>
      </select>
    )
  }
  return (
    <input
      value={(value as string | undefined) ?? ''}
      onChange={(e) => onChange(e.target.value)}
      className="mt-1 w-full h-9 px-3 rounded-lg bg-[#15171b] border border-white/10 text-[13px] text-white placeholder:text-white/35 focus:outline-none focus:border-cyan-400/50"
      placeholder="—"
    />
  )
}

function RawPayloadPanel({
  item,
  onChanged,
  onFeedback,
}: {
  item: InboxItemDto
  onChanged: () => void
  onFeedback: (f: { kind: 'success' | 'error' | 'info'; msg: string }) => void
}) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-amber-400/30 bg-amber-500/[0.05] px-4 py-3 flex items-start gap-2">
        <AlertCircle className="h-4 w-4 text-amber-300 shrink-0 mt-0.5" />
        <p className="text-[12px] text-amber-100/90">
          Não foi possível analisar este payload automaticamente. Inspecione abaixo e remova quando
          tiver certeza do que é.
        </p>
      </div>
      <pre className="text-[11px] font-mono bg-[#0c0d10] border border-white/5 p-3 rounded-xl text-white/65 max-h-64 overflow-auto whitespace-pre-wrap break-words">
        {JSON.stringify(item.raw, null, 2)}
      </pre>
      <div className="flex justify-end">
        <button
          onClick={async () => {
            await fetch(`/api/kommo/inbox/${item.id}`, { method: 'DELETE' })
            onFeedback({ kind: 'info', msg: 'Item removido.' })
            onChanged()
          }}
          className="inline-flex items-center gap-2 px-3 h-9 rounded-xl border border-rose-400/30 bg-rose-500/[0.06] text-rose-300 text-[12px] hover:bg-rose-500/15 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Remover
        </button>
      </div>
    </div>
  )
}
