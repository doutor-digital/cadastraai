'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ScrollText,
  UserPlus,
  ClipboardPlus,
  HeartPulse,
  Wallet,
  Search,
  Filter,
  Calendar,
  RefreshCw,
  Download,
  AlertCircle,
  UploadCloud,
} from 'lucide-react'
import {
  empresasApi,
  leadsApi,
  type EmpresaDto,
  type LeadDetailDto,
  type LeadSummaryDto,
} from '@/lib/api'
import { cn } from '@/lib/utils'

interface LogsViewProps {
  onBack: () => void
}

type EventKind = 'lead' | 'consulta' | 'tratamento' | 'recebimento'

interface AuditEvent {
  id: string
  kind: EventKind
  at: string
  leadId: string
  leadNome: string
  responsavel: string
  importado: boolean
  detail: string
  amount?: number
}

const KIND_LABEL: Record<EventKind, string> = {
  lead: 'Lead criado',
  consulta: 'Consulta cadastrada',
  tratamento: 'Tratamento fechado',
  recebimento: 'Recebimento registrado',
}

const KIND_COLOR: Record<EventKind, { bg: string; text: string; border: string; ring: string }> = {
  lead: { bg: 'bg-cyan-500/10', text: 'text-cyan-300', border: 'border-cyan-400/30', ring: 'ring-cyan-400/30' },
  consulta: { bg: 'bg-violet-500/10', text: 'text-violet-300', border: 'border-violet-400/30', ring: 'ring-violet-400/30' },
  tratamento: { bg: 'bg-emerald-500/10', text: 'text-emerald-300', border: 'border-emerald-400/30', ring: 'ring-emerald-400/30' },
  recebimento: { bg: 'bg-amber-500/10', text: 'text-amber-300', border: 'border-amber-400/30', ring: 'ring-amber-400/30' },
}

function KindIcon({ kind, className }: { kind: EventKind; className?: string }) {
  const Icon = kind === 'lead' ? UserPlus : kind === 'consulta' ? ClipboardPlus : kind === 'tratamento' ? HeartPulse : Wallet
  return <Icon className={className} />
}

const dateTimeFmt = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return dateTimeFmt.format(d)
}

function relativeTime(iso: string): string {
  const t = new Date(iso).getTime()
  if (!Number.isFinite(t)) return ''
  const diff = Date.now() - t
  const min = Math.floor(diff / 60_000)
  if (min < 1) return 'agora'
  if (min < 60) return `há ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `há ${h} h`
  const d = Math.floor(h / 24)
  if (d < 30) return `há ${d} d`
  const mo = Math.floor(d / 30)
  if (mo < 12) return `há ${mo} mês${mo === 1 ? '' : 'es'}`
  return `há ${Math.floor(mo / 12)} ano(s)`
}

function startOfRange(range: string): Date | null {
  const now = new Date()
  if (range === 'hoje') return new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (range === '7d') return new Date(now.getTime() - 7 * 86_400_000)
  if (range === '30d') return new Date(now.getTime() - 30 * 86_400_000)
  if (range === '90d') return new Date(now.getTime() - 90 * 86_400_000)
  return null
}

function downloadCsv(events: AuditEvent[]) {
  const header = ['quando', 'tipo', 'lead', 'responsavel', 'detalhe', 'valor', 'origem']
  const rows = events.map((e) => [
    formatDateTime(e.at),
    KIND_LABEL[e.kind],
    e.leadNome,
    e.responsavel,
    e.detail,
    e.amount != null ? String(e.amount).replace('.', ',') : '',
    e.importado ? 'Importado' : 'Manual',
  ])
  const csv = [header, ...rows]
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `logs-cadastraai-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function LogsView({ onBack }: LogsViewProps) {
  const [empresas, setEmpresas] = useState<EmpresaDto[]>([])
  const [empresaId, setEmpresaId] = useState('')
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [refetchTick, setRefetchTick] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [kindFilter, setKindFilter] = useState<EventKind | 'todos'>('todos')
  const [rangeFilter, setRangeFilter] = useState<'tudo' | 'hoje' | '7d' | '30d' | '90d'>('30d')
  const [responsavelFilter, setResponsavelFilter] = useState<string>('todos')
  const [fonteFilter, setFonteFilter] = useState<'todos' | 'manual' | 'importado'>('todos')

  // Carrega empresas
  useEffect(() => {
    let cancelled = false
    empresasApi
      .list()
      .then((list) => {
        if (cancelled) return
        setEmpresas(list)
        setEmpresaId((prev) => prev || list[0]?.id || '')
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Erro ao carregar empresas.')
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Carrega leads + detalhes e monta eventos
  useEffect(() => {
    if (!empresaId) return
    let cancelled = false
    setLoading(true)
    setError(null)

    async function load() {
      try {
        const resp = await leadsApi.list(empresaId, { pageSize: 500 })
        if (cancelled) return

        // Pra ter consulta/tratamento/recebimentos precisamos o detalhe — só dos que têm consulta.
        const detailsToFetch = resp.items.filter((l) => l.temConsulta).map((l) => l.id)
        const details = await Promise.all(
          detailsToFetch.map((id) => leadsApi.get(id).catch(() => null)),
        )
        if (cancelled) return

        const detailMap = new Map<string, LeadDetailDto>()
        for (const d of details) if (d) detailMap.set(d.id, d)

        const out: AuditEvent[] = []
        for (const l of resp.items) {
          out.push({
            id: `lead:${l.id}`,
            kind: 'lead',
            at: l.createdAt,
            leadId: l.id,
            leadNome: l.nome,
            responsavel: l.nomeResponsavel,
            importado: l.importado,
            detail: leadDetailLine(l),
          })
          const detail = detailMap.get(l.id)
          if (detail?.consulta) {
            out.push({
              id: `consulta:${detail.consulta.id}`,
              kind: 'consulta',
              at: detail.consulta.createdAt,
              leadId: l.id,
              leadNome: l.nome,
              responsavel: l.nomeResponsavel,
              importado: l.importado,
              detail: consultaDetailLine(detail.consulta),
              amount: detail.consulta.orcamento,
            })
            for (const r of detail.consulta.recebimentos ?? []) {
              out.push({
                id: `recebimento:${r.id}`,
                kind: 'recebimento',
                at: r.dataRecebimento,
                leadId: l.id,
                leadNome: l.nome,
                responsavel: l.nomeResponsavel,
                importado: l.importado,
                detail: `Consulta · ${r.formaPagamento}`,
                amount: r.valorRecebimento,
              })
            }
            if (detail.consulta.tratamento) {
              out.push({
                id: `tratamento:${detail.consulta.tratamento.id}`,
                kind: 'tratamento',
                at: detail.consulta.tratamento.createdAt,
                leadId: l.id,
                leadNome: l.nome,
                responsavel: l.nomeResponsavel,
                importado: l.importado,
                detail: detail.consulta.tratamento.planoTratamento,
                amount: detail.consulta.tratamento.valorPlano,
              })
              for (const r of detail.consulta.tratamento.recebimentos ?? []) {
                out.push({
                  id: `recebimento:${r.id}`,
                  kind: 'recebimento',
                  at: r.dataRecebimento,
                  leadId: l.id,
                  leadNome: l.nome,
                  responsavel: l.nomeResponsavel,
                  importado: l.importado,
                  detail: `Tratamento · ${r.formaPagamento}`,
                  amount: r.valorRecebimento,
                })
              }
            }
          }
        }
        out.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
        setEvents(out)
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Erro ao carregar logs.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [empresaId, refetchTick])

  const responsaveis = useMemo(() => {
    const set = new Set<string>()
    for (const e of events) if (e.responsavel) set.add(e.responsavel)
    return Array.from(set).sort()
  }, [events])

  const filtered = useMemo(() => {
    const minTime = startOfRange(rangeFilter)?.getTime() ?? null
    const q = search.trim().toLowerCase()
    return events.filter((e) => {
      if (kindFilter !== 'todos' && e.kind !== kindFilter) return false
      if (minTime != null && new Date(e.at).getTime() < minTime) return false
      if (responsavelFilter !== 'todos' && e.responsavel !== responsavelFilter) return false
      if (fonteFilter === 'manual' && e.importado) return false
      if (fonteFilter === 'importado' && !e.importado) return false
      if (q && !`${e.leadNome} ${e.responsavel} ${e.detail}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [events, kindFilter, rangeFilter, responsavelFilter, fonteFilter, search])

  const counts = useMemo(() => {
    const c = { lead: 0, consulta: 0, tratamento: 0, recebimento: 0 }
    for (const e of filtered) c[e.kind]++
    return c
  }, [filtered])

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
        <div className="flex items-center gap-2">
          <button
            onClick={() => filtered.length && downloadCsv(filtered)}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-2 px-3 h-9 rounded-xl border border-white/10 bg-white/[0.03] text-[13px] text-white/70 hover:text-white hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </button>
          <button
            onClick={() => setRefetchTick((t) => t + 1)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 h-9 rounded-xl border border-white/10 bg-white/[0.03] text-[13px] text-white/70 hover:text-white hover:border-white/20 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Hero */}
      <div
        className="rounded-3xl p-7 mb-5 text-cyan-50"
        style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0e7490 60%, #075985 100%)' }}
      >
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-white/15 grid place-items-center">
            <ScrollText className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-[12px] uppercase tracking-[0.2em] text-cyan-100/85 mb-1">Auditoria</p>
            <h1 className="text-[28px] font-bold tracking-tight leading-none">Trilha de eventos</h1>
            <p className="text-[13px] text-cyan-100/85 mt-2">
              Toda criação de lead, consulta, tratamento e recebimento da empresa selecionada — em ordem
              cronológica. Use os filtros para investigar.
            </p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="rounded-3xl border border-white/5 bg-[#15171b] p-5 space-y-4 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {empresas.length > 1 && (
            <div>
              <label className="text-[10px] uppercase tracking-wider text-white/45 font-semibold">Empresa</label>
              <select
                value={empresaId}
                onChange={(e) => setEmpresaId(e.target.value)}
                className="mt-1 w-full h-10 px-3 rounded-xl bg-[#0c0d10] border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-400/50"
              >
                {empresas.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nome}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-white/45 font-semibold">Período</label>
            <select
              value={rangeFilter}
              onChange={(e) => setRangeFilter(e.target.value as typeof rangeFilter)}
              className="mt-1 w-full h-10 px-3 rounded-xl bg-[#0c0d10] border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-400/50"
            >
              <option value="hoje">Hoje</option>
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="90d">Últimos 90 dias</option>
              <option value="tudo">Tudo</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-white/45 font-semibold">Responsável</label>
            <select
              value={responsavelFilter}
              onChange={(e) => setResponsavelFilter(e.target.value)}
              className="mt-1 w-full h-10 px-3 rounded-xl bg-[#0c0d10] border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-400/50"
            >
              <option value="todos">Todos</option>
              {responsaveis.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-white/45 font-semibold">Origem</label>
            <select
              value={fonteFilter}
              onChange={(e) => setFonteFilter(e.target.value as typeof fonteFilter)}
              className="mt-1 w-full h-10 px-3 rounded-xl bg-[#0c0d10] border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-400/50"
            >
              <option value="todos">Todos</option>
              <option value="manual">Manual</option>
              <option value="importado">Importado</option>
            </select>
          </div>
        </div>

        {/* Busca + chips de tipo */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por lead, responsável ou detalhe…"
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#0c0d10] border border-white/10 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-cyan-400/50"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <KindChip
              active={kindFilter === 'todos'}
              onClick={() => setKindFilter('todos')}
              label="Tudo"
              count={filtered.length}
            />
            <KindChip
              active={kindFilter === 'lead'}
              onClick={() => setKindFilter('lead')}
              label="Leads"
              count={counts.lead}
              kind="lead"
            />
            <KindChip
              active={kindFilter === 'consulta'}
              onClick={() => setKindFilter('consulta')}
              label="Consultas"
              count={counts.consulta}
              kind="consulta"
            />
            <KindChip
              active={kindFilter === 'tratamento'}
              onClick={() => setKindFilter('tratamento')}
              label="Tratamentos"
              count={counts.tratamento}
              kind="tratamento"
            />
            <KindChip
              active={kindFilter === 'recebimento'}
              onClick={() => setKindFilter('recebimento')}
              label="Recebimentos"
              count={counts.recebimento}
              kind="recebimento"
            />
          </div>
        </div>

        {/* Aviso sobre limitação de auditoria */}
        <div className="flex items-start gap-3 rounded-xl border border-amber-400/20 bg-amber-500/[0.04] px-4 py-3">
          <AlertCircle className="h-4 w-4 text-amber-300 shrink-0 mt-0.5" />
          <p className="text-[12px] text-amber-100/80 leading-relaxed">
            <strong>Sobre o "quem fez":</strong> a coluna "Responsável" reflete o
            <em> nomeResponsavel</em> do lead — não necessariamente quem clicou em "Salvar". Para
            rastrear o usuário autor de cada evento, é preciso adicionar <code>createdBy</code> nas
            entidades do backend C#.
          </p>
        </div>
      </div>

      {/* Erro */}
      {error && (
        <div className="rounded-2xl border border-red-400/30 bg-red-500/[0.06] px-5 py-4 mb-5 text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Timeline */}
      {loading && events.length === 0 ? (
        <SkeletonTimeline />
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 px-6 py-16 text-center">
          <Filter className="h-7 w-7 text-white/30 mx-auto mb-3" />
          <p className="text-[15px] font-semibold text-white/85 mb-1">Nada para mostrar</p>
          <p className="text-[13px] text-white/55">
            Sem eventos no período selecionado, ou os filtros estão restritivos demais.
          </p>
        </div>
      ) : (
        <div className="rounded-3xl border border-white/5 bg-[#15171b] overflow-hidden">
          <ul className="divide-y divide-white/5">
            {filtered.map((event) => (
              <EventRow key={event.id} event={event} />
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  )
}

function KindChip({
  active,
  onClick,
  label,
  count,
  kind,
}: {
  active: boolean
  onClick: () => void
  label: string
  count: number
  kind?: EventKind
}) {
  const palette = kind ? KIND_COLOR[kind] : null
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 h-10 px-3 rounded-xl border text-[13px] transition-colors',
        active
          ? palette
            ? `${palette.bg} ${palette.text} ${palette.border}`
            : 'bg-white/10 text-white border-white/20'
          : 'bg-[#0c0d10] text-white/55 border-white/10 hover:text-white hover:border-white/20',
      )}
    >
      {kind && <KindIcon kind={kind} className="h-4 w-4" />}
      <span className="font-semibold">{label}</span>
      <span className="text-[11px] tabular-nums opacity-80">{count}</span>
    </button>
  )
}

function leadDetailLine(l: LeadSummaryDto): string {
  const bits: string[] = []
  bits.push(l.tipo === 'Resgate' ? 'Resgate' : 'Cadastro')
  bits.push(l.origem)
  if (l.agendouConsulta) bits.push('agendou')
  else if (l.motivoNaoAgendamento) bits.push(`não agendou (${l.motivoNaoAgendamento})`)
  return bits.join(' · ')
}

function consultaDetailLine(c: { compareceu: boolean; fechouTratamento: boolean; tratamentoIndicado: string }): string {
  const bits: string[] = []
  if (c.compareceu) bits.push('compareceu')
  else bits.push('não compareceu')
  if (c.fechouTratamento) bits.push('fechou tratamento')
  if (c.tratamentoIndicado) bits.push(c.tratamentoIndicado)
  return bits.join(' · ')
}

function EventRow({ event }: { event: AuditEvent }) {
  const palette = KIND_COLOR[event.kind]
  return (
    <li className="px-5 py-4 hover:bg-white/[0.02] transition-colors">
      <div className="flex items-start gap-4">
        <div
          className={cn(
            'h-10 w-10 rounded-xl grid place-items-center shrink-0 border',
            palette.bg,
            palette.border,
          )}
        >
          <KindIcon kind={event.kind} className={cn('h-4 w-4', palette.text)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2 mb-1">
            <span className={cn('text-[11px] uppercase tracking-wider font-bold', palette.text)}>
              {KIND_LABEL[event.kind]}
            </span>
            {event.importado && (
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-violet-300 bg-violet-500/10 border border-violet-400/30 px-1.5 py-0.5 rounded-md">
                <UploadCloud className="h-3 w-3" />
                Importado
              </span>
            )}
            {event.amount != null && (
              <span className="text-[11px] font-mono tabular-nums text-emerald-300 bg-emerald-500/10 border border-emerald-400/30 px-1.5 py-0.5 rounded-md">
                R$ {event.amount.toLocaleString('pt-BR')}
              </span>
            )}
          </div>
          <p className="text-[14px] text-white font-semibold truncate">{event.leadNome}</p>
          <p className="text-[12px] text-white/55 truncate">{event.detail}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[12px] text-white/85 font-semibold">{event.responsavel || '—'}</p>
          <p className="text-[11px] text-white/45">{relativeTime(event.at)}</p>
          <p className="text-[10px] text-white/35 font-mono mt-0.5">{formatDateTime(event.at)}</p>
        </div>
      </div>
    </li>
  )
}

function SkeletonTimeline() {
  return (
    <div className="rounded-3xl border border-white/5 bg-[#15171b] overflow-hidden">
      <ul className="divide-y divide-white/5">
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i} className="px-5 py-4 flex items-center gap-4 animate-pulse">
            <div className="h-10 w-10 rounded-xl bg-white/5" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-24 rounded bg-white/5" />
              <div className="h-4 w-1/2 rounded bg-white/10" />
              <div className="h-3 w-1/3 rounded bg-white/5" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-20 rounded bg-white/5" />
              <div className="h-3 w-16 rounded bg-white/5" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
