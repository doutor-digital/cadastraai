'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { DashboardHeader } from '@/components/dashboard/header'
import { useCadastroStore, useIsClient } from '@/lib/cadastro-store'
import { AnimatedNumber } from '@/components/ui/animated-number'
import { cn } from '@/lib/utils'
import type { DashboardFilters, Lead, Consulta, Tratamento } from '@/types'

const dayMs = 24 * 60 * 60 * 1000

function periodWindow(periodo: DashboardFilters['periodo']) {
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  const todayMs = startOfToday.getTime()
  switch (periodo) {
    case 'hoje':       return { startMs: todayMs,                prevStartMs: todayMs - dayMs,           prevEndMs: todayMs }
    case 'ontem':      return { startMs: todayMs - dayMs,        prevStartMs: todayMs - 2 * dayMs,       prevEndMs: todayMs - dayMs }
    case 'semana':     return { startMs: todayMs - 6 * dayMs,    prevStartMs: todayMs - 13 * dayMs,      prevEndMs: todayMs - 6 * dayMs }
    case 'mes':        return { startMs: todayMs - 29 * dayMs,   prevStartMs: todayMs - 59 * dayMs,      prevEndMs: todayMs - 29 * dayMs }
    case 'trimestre':  return { startMs: todayMs - 89 * dayMs,   prevStartMs: todayMs - 179 * dayMs,     prevEndMs: todayMs - 89 * dayMs }
    default:           return { startMs: 0,                       prevStartMs: 0,                          prevEndMs: Date.now() }
  }
}

function inWindow(iso: string | undefined, startMs: number, endMs?: number): boolean {
  if (!iso) return false
  const t = new Date(iso).getTime()
  if (!Number.isFinite(t)) return false
  if (endMs !== undefined) return t >= startMs && t < endMs
  return t >= startMs
}

function brl(n: number): string {
  return n.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

function deltaPct(curr: number, prev: number): { value: string; positive: boolean } {
  if (prev === 0 && curr === 0) return { value: '0%', positive: true }
  if (prev === 0) return { value: '+100%', positive: true }
  const pct = Math.round(((curr - prev) / prev) * 100)
  return {
    value: `${pct >= 0 ? '+' : ''}${pct}%`,
    positive: pct >= 0,
  }
}

interface Computed {
  leads: number
  prevLeads: number
  agendados: number
  consultas: number
  prevConsultas: number
  tratamentos: number
  prevTratamentos: number
  receita: number
  prevReceita: number
  ticketMedio: number
  origens: { nome: string; count: number; pct: number }[]
  responsaveis: { nome: string; leads: number; fechados: number; receita: number }[]
  formas: { forma: string; valor: number; pct: number }[]
  planos: { nome: string; count: number; valor: number; pct: number }[]
}

function compute(
  leads: Lead[],
  consultas: Consulta[],
  tratamentos: Tratamento[],
  win: ReturnType<typeof periodWindow>,
): Computed {
  const leadsCurr = leads.filter((l) => inWindow(l.createdAt, win.startMs))
  const leadsPrev = leads.filter((l) => inWindow(l.createdAt, win.prevStartMs, win.prevEndMs))
  const consultasCurr = consultas.filter((c) => inWindow(c.createdAt, win.startMs))
  const consultasPrev = consultas.filter((c) => inWindow(c.createdAt, win.prevStartMs, win.prevEndMs))
  const tratamentosCurr = tratamentos.filter((t) => inWindow(t.createdAt, win.startMs))
  const tratamentosPrev = tratamentos.filter((t) => inWindow(t.createdAt, win.prevStartMs, win.prevEndMs))

  const sumRecs = (list: Array<{ recebimentos: { valorRecebimento: number }[] }>) =>
    list.reduce((s, item) => s + item.recebimentos.reduce((a, r) => a + r.valorRecebimento, 0), 0)

  const receitaCurr = sumRecs(consultasCurr) + sumRecs(tratamentosCurr)
  const receitaPrev = sumRecs(consultasPrev) + sumRecs(tratamentosPrev)
  const ticketMedio = tratamentosCurr.length > 0 ? receitaCurr / tratamentosCurr.length : 0

  const origemMap = new Map<string, number>()
  for (const l of leadsCurr) {
    const k = (l.origem || 'Não informado').trim() || 'Não informado'
    origemMap.set(k, (origemMap.get(k) ?? 0) + 1)
  }
  const origemTotal = leadsCurr.length || 1
  const origens = [...origemMap.entries()]
    .map(([nome, count]) => ({ nome, count, pct: Math.round((count / origemTotal) * 100) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4)

  const responsavelSet = new Set<string>()
  for (const l of leads) if (l.nomeResponsavel) responsavelSet.add(l.nomeResponsavel)
  const responsaveis = [...responsavelSet]
    .map((nome) => {
      const ls = leadsCurr.filter((l) => l.nomeResponsavel === nome)
      const cs = consultasCurr.filter((c) => ls.some((l) => l.id === c.leadId))
      const ts = tratamentosCurr.filter((t) => cs.some((c) => c.id === t.consultaId))
      const receita =
        cs.reduce((s, c) => s + c.recebimentos.reduce((a, r) => a + r.valorRecebimento, 0), 0) +
        ts.reduce((s, t) => s + t.recebimentos.reduce((a, r) => a + r.valorRecebimento, 0), 0)
      return { nome, leads: ls.length, fechados: ts.length, receita }
    })
    .sort((a, b) => b.fechados - a.fechados || b.receita - a.receita)

  const formaMap = new Map<string, number>()
  const allRecs = [...consultasCurr.flatMap((c) => c.recebimentos), ...tratamentosCurr.flatMap((t) => t.recebimentos)]
  for (const r of allRecs) {
    formaMap.set(r.formaPagamento, (formaMap.get(r.formaPagamento) ?? 0) + r.valorRecebimento)
  }
  const formaTotal = receitaCurr || 1
  const formas = [...formaMap.entries()]
    .map(([forma, valor]) => ({ forma, valor, pct: Math.round((valor / formaTotal) * 100) }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 4)

  const planoMap = new Map<string, { count: number; valor: number }>()
  for (const t of tratamentosCurr) {
    const k = (t.planoTratamento || 'Não informado').trim() || 'Não informado'
    const cur = planoMap.get(k) ?? { count: 0, valor: 0 }
    planoMap.set(k, { count: cur.count + 1, valor: cur.valor + t.valorPlano })
  }
  const planoCountTotal = tratamentosCurr.length || 1
  const planos = [...planoMap.entries()]
    .map(([nome, v]) => ({ nome, count: v.count, valor: v.valor, pct: Math.round((v.count / planoCountTotal) * 100) }))
    .sort((a, b) => b.count - a.count || b.valor - a.valor)
    .slice(0, 4)

  return {
    leads: leadsCurr.length,
    prevLeads: leadsPrev.length,
    agendados: leadsCurr.filter((l) => l.agendouConsulta).length,
    consultas: consultasCurr.length,
    prevConsultas: consultasPrev.length,
    tratamentos: tratamentosCurr.length,
    prevTratamentos: tratamentosPrev.length,
    receita: receitaCurr,
    prevReceita: receitaPrev,
    ticketMedio,
    origens,
    responsaveis,
    formas,
    planos,
  }
}

export function DashboardView() {
  const [filters, setFilters] = useState<DashboardFilters>({ periodo: 'mes' })
  const [tickNow, setTickNow] = useState(() => Date.now())
  const store = useCadastroStore()
  const isClient = useIsClient()

  useEffect(() => {
    const id = setInterval(() => setTickNow(Date.now()), 6000)
    return () => clearInterval(id)
  }, [])

  const win = useMemo(() => periodWindow(filters.periodo), [filters.periodo, tickNow])

  const m = useMemo<Computed>(() => {
    if (!isClient) {
      return {
        leads: 0, prevLeads: 0, agendados: 0,
        consultas: 0, prevConsultas: 0,
        tratamentos: 0, prevTratamentos: 0,
        receita: 0, prevReceita: 0, ticketMedio: 0,
        origens: [],
        responsaveis: [],
        formas: [],
        planos: [],
      }
    }
    return compute(store.leads, store.consultas, store.tratamentos, win)
  }, [store, win, isClient])

  const dReceita = deltaPct(m.receita, m.prevReceita)
  const dLeads = deltaPct(m.leads, m.prevLeads)
  const dTratamentos = deltaPct(m.tratamentos, m.prevTratamentos)

  const funilTotal = m.leads || 1

  return (
    <div className="min-h-full">
      <DashboardHeader filters={filters} onFilterChange={(next) => setFilters((p) => ({ ...p, ...next }))} />

      <main className="px-4 md:px-8 py-6 md:py-8 max-w-[1280px] mx-auto">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-6 gap-3 [grid-auto-rows:auto] md:[grid-auto-rows:160px]"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* HERO — Receita */}
          <div
            className="col-span-3 row-span-2 rounded-3xl p-7 flex flex-col justify-between text-cyan-50"
            style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0e7490 65%, #075985 100%)' }}
          >
            <div>
              <p className="text-[12px] uppercase tracking-[0.2em] text-cyan-100/85">Receita acumulada</p>
              <p className="text-[12px] text-cyan-100/65 mt-1">No período selecionado</p>
            </div>
            <div>
              <p className="text-[64px] font-bold tabular-nums leading-none tracking-tight">
                <AnimatedNumber value={m.receita} formatValue={(v) => brl(Math.round(v))} />
              </p>
              <div className="flex items-center gap-3 mt-4 text-[12px]">
                <span className="px-2 py-0.5 rounded-md bg-cyan-100/20 font-semibold tabular-nums">
                  {dReceita.value}
                </span>
                <span className="text-cyan-100/75">vs período anterior</span>
              </div>
            </div>
          </div>

          {/* Leads */}
          <div className="col-span-2 row-span-1 rounded-3xl bg-[#15171b] border border-white/[0.05] p-6 flex flex-col justify-between">
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">Leads</p>
            <div>
              <p className="text-[40px] font-bold tabular-nums leading-none">
                <AnimatedNumber value={m.leads} />
              </p>
              <p className={`text-[11px] mt-2 tabular-nums ${dLeads.positive ? 'text-cyan-400' : 'text-rose-400'}`}>
                {dLeads.value} vs anterior
              </p>
            </div>
          </div>

          {/* Tratamentos */}
          <div className="col-span-1 row-span-1 rounded-3xl bg-[#15171b] border border-white/[0.05] p-5 flex flex-col justify-between">
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">Fechados</p>
            <div>
              <p className="text-[36px] font-bold tabular-nums leading-none">
                <AnimatedNumber value={m.tratamentos} />
              </p>
              <p className={`text-[11px] mt-1 tabular-nums ${dTratamentos.positive ? 'text-cyan-400' : 'text-rose-400'}`}>
                {dTratamentos.value}
              </p>
            </div>
          </div>

          {/* Funil */}
          <div className="col-span-3 row-span-1 rounded-3xl bg-[#15171b] border border-white/[0.05] p-6">
            <div className="flex items-baseline justify-between mb-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">Funil</p>
              <p className="text-[12px] text-white/45 tabular-nums">{m.leads} → {m.tratamentos}</p>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Leads', n: m.leads },
                { label: 'Agendou', n: m.agendados },
                { label: 'Consulta', n: m.consultas },
                { label: 'Tratou', n: m.tratamentos },
              ].map((s, i) => (
                <div key={s.label} className="text-center">
                  <div
                    className="h-12 rounded-lg flex items-end justify-center"
                    style={{
                      background: `linear-gradient(180deg, transparent ${100 - (s.n / funilTotal) * 100}%, rgba(34,211,238,0.55) ${100 - (s.n / funilTotal) * 100}%)`,
                    }}
                  >
                    <span className="text-[14px] font-semibold tabular-nums pb-1">{s.n}</span>
                  </div>
                  <p className="text-[10px] text-white/50 mt-1.5 tracking-wider uppercase">{s.label}</p>
                  {i > 0 && (
                    <p className="text-[9px] text-cyan-400 tabular-nums">
                      {Math.round((s.n / funilTotal) * 100)}%
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Top origens / Planos / Formas (col 5–6, row 1–2) */}
          <TopBreakdownCard origens={m.origens} planos={m.planos} formas={m.formas} />


          {/* Ticket */}
          <div className="col-span-1 row-span-1 rounded-3xl bg-[#15171b] border border-white/[0.05] p-5 flex flex-col justify-between">
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">Ticket</p>
            <div>
              <p className="text-[24px] font-bold tabular-nums leading-none">
                <AnimatedNumber value={m.ticketMedio} formatValue={(v) => brl(Math.round(v))} />
              </p>
              <p className="text-[11px] text-white/45 mt-1.5">por tratamento</p>
            </div>
          </div>

          {/* Top atendentes */}
          <div className="col-span-3 row-span-1 rounded-3xl bg-[#15171b] border border-white/[0.05] p-5">
            <div className="flex items-baseline justify-between mb-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">Top atendentes</p>
              <p className="text-[11px] text-white/45">{m.responsaveis.length} responsáveis</p>
            </div>
            {m.responsaveis.length === 0 ? (
              <p className="text-[12px] text-white/45">Cadastre leads com responsáveis para aparecer aqui.</p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {m.responsaveis.slice(0, 3).map((r, i) => {
                  const medalEmoji = ['🥇', '🥈', '🥉'][i] ?? '·'
                  const conv = r.leads > 0 ? Math.round((r.fechados / r.leads) * 100) : 0
                  return (
                    <div
                      key={r.nome}
                      className={cn(
                        'rounded-xl border p-3',
                        i === 0
                          ? 'bg-cyan-500/[0.08] border-cyan-400/30'
                          : 'bg-white/[0.03] border-white/[0.05]',
                      )}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[14px]">{medalEmoji}</span>
                        <span className="text-[12px] font-medium truncate">{r.nome}</span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-[20px] font-bold tabular-nums">{r.fechados}</span>
                        <span className="text-[11px] text-white/45 tabular-nums">de {r.leads}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1.5 text-[11px]">
                        <span className="text-cyan-300 tabular-nums">{conv}% conv.</span>
                        <span className="text-white/55 tabular-nums">{brl(r.receita)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </motion.div>

        {m.leads === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 rounded-2xl border border-dashed border-white/[0.10] bg-white/[0.01] px-6 py-5 text-center"
          >
            <p className="text-sm text-white/85 font-medium">Nenhum cadastro no período</p>
            <p className="text-xs text-white/55 mt-1">
              Use o menu lateral para cadastrar Leads, Consultas, Tratamentos e Recebimentos.
            </p>
          </motion.div>
        )}
      </main>
    </div>
  )
}

interface TopBreakdownCardProps {
  origens: { nome: string; count: number; pct: number }[]
  planos: { nome: string; count: number; valor: number; pct: number }[]
  formas: { forma: string; valor: number; pct: number }[]
}

function TopBreakdownCard({ origens, planos, formas }: TopBreakdownCardProps) {
  const [tab, setTab] = useState<'origens' | 'planos' | 'formas'>('origens')

  const tabs = [
    { id: 'origens' as const, label: 'Origens' },
    { id: 'planos' as const, label: 'Planos' },
    { id: 'formas' as const, label: 'Pagamento' },
  ]

  const renderRows = () => {
    if (tab === 'origens') {
      if (origens.length === 0) return <EmptyHint text="Sem leads cadastrados ainda." />
      return origens.map((o) => (
        <BreakdownRow key={o.nome} label={o.nome} primary={String(o.count)} pct={o.pct} />
      ))
    }
    if (tab === 'planos') {
      if (planos.length === 0) return <EmptyHint text="Sem tratamentos fechados no período." />
      return planos.map((p) => (
        <BreakdownRow
          key={p.nome}
          label={p.nome}
          primary={`${p.count}× · ${brl(p.valor)}`}
          pct={p.pct}
        />
      ))
    }
    if (formas.length === 0) return <EmptyHint text="Sem recebimentos no período." />
    return formas.map((f) => (
      <BreakdownRow key={f.forma} label={f.forma} primary={brl(f.valor)} pct={f.pct} />
    ))
  }

  return (
    <div className="col-span-2 row-span-2 rounded-3xl bg-[#15171b] border border-white/[0.05] p-6 flex flex-col">
      <div className="flex items-center gap-1 rounded-xl bg-white/[0.03] p-0.5 mb-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex-1 h-8 rounded-lg text-[11px] uppercase tracking-wider font-semibold transition-colors',
              tab === t.id ? 'bg-white text-slate-900' : 'text-white/55 hover:text-white',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="space-y-4 flex-1 overflow-hidden">{renderRows()}</div>
    </div>
  )
}

function BreakdownRow({ label, primary, pct }: { label: string; primary: string; pct: number }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 mb-1.5">
        <span className="text-[14px] font-medium truncate">{label}</span>
        <span className="text-[12px] text-white/55 tabular-nums shrink-0">{primary}</span>
      </div>
      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div className="h-full bg-cyan-400" style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
    </div>
  )
}

function EmptyHint({ text }: { text: string }) {
  return <p className="text-[12px] text-white/45">{text}</p>
}
