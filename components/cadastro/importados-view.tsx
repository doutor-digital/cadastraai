'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, AlertCircle, Filter, RotateCcw, Search } from 'lucide-react'
import { empresasApi, leadsApi, type EmpresaDto, type LeadSummaryDto } from '@/lib/api'
import { cn } from '@/lib/utils'

interface Props {
  onBack: () => void
}

type Tri = '' | 'sim' | 'nao'

interface Filters {
  search: string
  empresaId: string
  origem: string
  tipo: string
  tipoResgate: string
  responsavel: string
  motivoNaoAgendamento: string
  motivoNaoFechamento: string
  interacao: Tri
  agendou: Tri
  pagamentoAntecipado: Tri
  temConsulta: Tri
  compareceu: Tri
  fechouTratamento: Tri
  createdFrom: string
  createdTo: string
  agendamentoFrom: string
  agendamentoTo: string
  ano: string
  mes: string
  diaSemana: string
  ddd: string
  letraInicial: string
  periodoAgendamento: '' | 'manha' | 'tarde' | 'noite'
}

const initialFilters: Filters = {
  search: '',
  empresaId: '',
  origem: '',
  tipo: '',
  tipoResgate: '',
  responsavel: '',
  motivoNaoAgendamento: '',
  motivoNaoFechamento: '',
  interacao: '',
  agendou: '',
  pagamentoAntecipado: '',
  temConsulta: '',
  compareceu: '',
  fechouTratamento: '',
  createdFrom: '',
  createdTo: '',
  agendamentoFrom: '',
  agendamentoTo: '',
  ano: '',
  mes: '',
  diaSemana: '',
  ddd: '',
  letraInicial: '',
  periodoAgendamento: '',
}

const DIAS_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

function uniq(values: (string | null | undefined)[]): string[] {
  const set = new Set<string>()
  for (const v of values) {
    const s = (v ?? '').trim()
    if (s) set.add(s)
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'))
}

function ddd(tel: string): string {
  const d = tel.replace(/\D/g, '')
  return d.length >= 10 ? d.slice(0, 2) : ''
}

function tri(value: boolean | null | undefined, want: Tri): boolean {
  if (want === '') return true
  if (value === null || value === undefined) return want === 'nao' ? true : false
  return want === 'sim' ? value : !value
}

function parseDateOnly(s: string): Date | null {
  if (!s) return null
  const d = new Date(s)
  return isNaN(d.getTime()) ? null : d
}

export function ImportadosView({ onBack }: Props) {
  const [empresas, setEmpresas] = useState<EmpresaDto[]>([])
  const [leads, setLeads] = useState<LeadSummaryDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<Filters>(initialFilters)
  const [showFilters, setShowFilters] = useState(true)

  useEffect(() => {
    empresasApi
      .list()
      .then((list) => {
        setEmpresas(list)
        if (list.length > 0 && !filters.empresaId) {
          setFilters((f) => ({ ...f, empresaId: list[0].id }))
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar empresas'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!filters.empresaId) return
    let cancelled = false
    setLoading(true)
    setError(null)
    ;(async () => {
      try {
        const acc: LeadSummaryDto[] = []
        let page = 0
        while (true) {
          const resp = await leadsApi.list(filters.empresaId, { page, pageSize: 500 })
          if (cancelled) return
          acc.push(...resp.items)
          if (acc.length >= resp.total || resp.items.length === 0) break
          page++
        }
        if (!cancelled) setLeads(acc)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Erro ao carregar leads')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [filters.empresaId])

  const optionsOrigem = useMemo(() => uniq(leads.map((l) => l.origem)), [leads])
  const optionsTipo = useMemo(() => uniq(leads.map((l) => l.tipo)), [leads])
  const optionsTipoResgate = useMemo(() => uniq(leads.map((l) => l.tipoResgate)), [leads])
  const optionsResponsavel = useMemo(() => uniq(leads.map((l) => l.nomeResponsavel)), [leads])
  const optionsMotivoNaoAg = useMemo(() => uniq(leads.map((l) => l.motivoNaoAgendamento)), [leads])
  const optionsMotivoNaoFe = useMemo(() => uniq(leads.map((l) => l.motivoNaoFechamento)), [leads])
  const optionsAno = useMemo(
    () => uniq(leads.map((l) => String(new Date(l.createdAt).getFullYear()))),
    [leads],
  )
  const optionsDDD = useMemo(() => uniq(leads.map((l) => ddd(l.telefone))), [leads])

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase()
    const cFrom = parseDateOnly(filters.createdFrom)
    const cTo = parseDateOnly(filters.createdTo)
    const aFrom = parseDateOnly(filters.agendamentoFrom)
    const aTo = parseDateOnly(filters.agendamentoTo)
    return leads.filter((l) => {
      if (q) {
        const hay = `${l.nome} ${l.telefone} ${l.origem} ${l.nomeResponsavel}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (filters.origem && l.origem !== filters.origem) return false
      if (filters.tipo && l.tipo !== filters.tipo) return false
      if (filters.tipoResgate && l.tipoResgate !== filters.tipoResgate) return false
      if (filters.responsavel && l.nomeResponsavel !== filters.responsavel) return false
      if (filters.motivoNaoAgendamento && l.motivoNaoAgendamento !== filters.motivoNaoAgendamento) return false
      if (filters.motivoNaoFechamento && l.motivoNaoFechamento !== filters.motivoNaoFechamento) return false
      if (!tri(l.interacao, filters.interacao)) return false
      if (!tri(l.agendouConsulta, filters.agendou)) return false
      if (!tri(l.pagamentoAntecipado, filters.pagamentoAntecipado)) return false
      if (!tri(l.temConsulta, filters.temConsulta)) return false
      if (!tri(l.compareceu ?? null, filters.compareceu)) return false
      if (!tri(l.fechouTratamento ?? null, filters.fechouTratamento)) return false

      const created = new Date(l.createdAt)
      if (cFrom && created < cFrom) return false
      if (cTo) {
        const end = new Date(cTo); end.setHours(23, 59, 59, 999)
        if (created > end) return false
      }
      if (filters.ano && String(created.getFullYear()) !== filters.ano) return false
      if (filters.mes && String(created.getMonth() + 1) !== filters.mes) return false
      if (filters.diaSemana && String(created.getDay()) !== filters.diaSemana) return false

      if (filters.agendamentoFrom || filters.agendamentoTo || filters.periodoAgendamento) {
        if (!l.dataAgendamento) return false
        const ag = new Date(l.dataAgendamento)
        if (aFrom && ag < aFrom) return false
        if (aTo) {
          const end = new Date(aTo); end.setHours(23, 59, 59, 999)
          if (ag > end) return false
        }
        if (filters.periodoAgendamento) {
          const h = ag.getHours()
          if (filters.periodoAgendamento === 'manha' && !(h >= 5 && h < 12)) return false
          if (filters.periodoAgendamento === 'tarde' && !(h >= 12 && h < 18)) return false
          if (filters.periodoAgendamento === 'noite' && !(h >= 18 || h < 5)) return false
        }
      }

      if (filters.ddd && ddd(l.telefone) !== filters.ddd) return false
      if (filters.letraInicial) {
        const first = (l.nome.trim()[0] ?? '').toUpperCase()
        if (first !== filters.letraInicial.toUpperCase()) return false
      }
      return true
    })
  }, [leads, filters])

  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => setFilters((f) => ({ ...f, [k]: v }))
  const reset = () => setFilters((f) => ({ ...initialFilters, empresaId: f.empresaId }))

  return (
    <motion.div
      className="px-8 py-8 max-w-[1400px] mx-auto"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={onBack}
          className="group inline-flex items-center gap-2 px-3 h-9 rounded-xl bg-[#15171b] border border-white/[0.05] text-[13px] text-white/70 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters((s) => !s)}
            className="inline-flex items-center gap-2 px-3 h-9 rounded-xl bg-[#15171b] border border-white/[0.05] text-[13px] text-white/70 hover:text-white"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? 'Ocultar' : 'Mostrar'} filtros
          </button>
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-3 h-9 rounded-xl bg-[#15171b] border border-white/[0.05] text-[13px] text-white/70 hover:text-white"
          >
            <RotateCcw className="h-4 w-4" />
            Limpar filtros
          </button>
        </div>
      </div>

      {/* Hero */}
      <div
        className="rounded-3xl p-6 mb-5 text-cyan-50"
        style={{ background: 'linear-gradient(135deg, #0e7490 0%, #075985 100%)' }}
      >
        <p className="text-[12px] uppercase tracking-[0.2em] text-cyan-100/85 mb-1">Avançado</p>
        <h1 className="text-[28px] font-bold tracking-tight leading-none">Importados</h1>
        <p className="text-[13px] text-cyan-100/85 mt-2">
          Visualize todos os leads no banco, com filtros avançados.
        </p>
      </div>

      {/* Empresa selector */}
      <div className="rounded-3xl bg-[#15171b] border border-white/[0.05] p-4 mb-4 flex items-center gap-3">
        <label className="text-[12px] uppercase tracking-wider text-white/55 shrink-0">Empresa</label>
        <select
          value={filters.empresaId}
          onChange={(e) => set('empresaId', e.target.value)}
          style={{ colorScheme: 'dark' }}
          className="flex-1 h-10 px-3 rounded-xl bg-[#0c0d10] border border-white/[0.05] text-[13px]"
        >
          <option value="">— selecione —</option>
          {empresas.map((e) => (
            <option key={e.id} value={e.id}>{e.nome}</option>
          ))}
        </select>
        <span className="text-[12px] text-white/55 tabular-nums">
          {loading ? 'carregando…' : `${filtered.length} de ${leads.length}`}
        </span>
      </div>

      {error && (
        <div className="rounded-2xl bg-rose-500/[0.08] border border-rose-400/30 text-rose-200 text-sm p-3 mb-4 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {showFilters && (
        <div className="rounded-3xl bg-[#15171b] border border-white/[0.05] p-5 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <Field label="Busca (nome, telefone, origem, responsável)">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/40" />
                <input
                  value={filters.search}
                  onChange={(e) => set('search', e.target.value)}
                  placeholder="Pesquisar…"
                  className="w-full h-9 pl-8 pr-3 rounded-xl bg-[#0c0d10] border border-white/[0.05] text-[13px]"
                />
              </div>
            </Field>
            <SelectField label="Origem" value={filters.origem} onChange={(v) => set('origem', v)} options={optionsOrigem} />
            <SelectField label="Tipo" value={filters.tipo} onChange={(v) => set('tipo', v)} options={optionsTipo} />
            <SelectField label="Tipo de Resgate" value={filters.tipoResgate} onChange={(v) => set('tipoResgate', v)} options={optionsTipoResgate} />
            <SelectField label="Responsável" value={filters.responsavel} onChange={(v) => set('responsavel', v)} options={optionsResponsavel} />
            <SelectField label="Motivo não agendamento" value={filters.motivoNaoAgendamento} onChange={(v) => set('motivoNaoAgendamento', v)} options={optionsMotivoNaoAg} />
            <SelectField label="Motivo não fechamento" value={filters.motivoNaoFechamento} onChange={(v) => set('motivoNaoFechamento', v)} options={optionsMotivoNaoFe} />
            <TriField label="Houve interação?" value={filters.interacao} onChange={(v) => set('interacao', v)} />
            <TriField label="Agendou consulta?" value={filters.agendou} onChange={(v) => set('agendou', v)} />
            <TriField label="Pagamento antecipado?" value={filters.pagamentoAntecipado} onChange={(v) => set('pagamentoAntecipado', v)} />
            <TriField label="Tem consulta?" value={filters.temConsulta} onChange={(v) => set('temConsulta', v)} />
            <TriField label="Compareceu?" value={filters.compareceu} onChange={(v) => set('compareceu', v)} />
            <TriField label="Fechou tratamento?" value={filters.fechouTratamento} onChange={(v) => set('fechouTratamento', v)} />
            <Field label="Cadastro de">
              <input type="date" value={filters.createdFrom} onChange={(e) => set('createdFrom', e.target.value)}
                style={{ colorScheme: 'dark' }}
                className="w-full h-9 px-3 rounded-xl bg-[#0c0d10] border border-white/[0.05] text-[13px]" />
            </Field>
            <Field label="Cadastro até">
              <input type="date" value={filters.createdTo} onChange={(e) => set('createdTo', e.target.value)}
                style={{ colorScheme: 'dark' }}
                className="w-full h-9 px-3 rounded-xl bg-[#0c0d10] border border-white/[0.05] text-[13px]" />
            </Field>
            <Field label="Agendamento de">
              <input type="date" value={filters.agendamentoFrom} onChange={(e) => set('agendamentoFrom', e.target.value)}
                style={{ colorScheme: 'dark' }}
                className="w-full h-9 px-3 rounded-xl bg-[#0c0d10] border border-white/[0.05] text-[13px]" />
            </Field>
            <Field label="Agendamento até">
              <input type="date" value={filters.agendamentoTo} onChange={(e) => set('agendamentoTo', e.target.value)}
                style={{ colorScheme: 'dark' }}
                className="w-full h-9 px-3 rounded-xl bg-[#0c0d10] border border-white/[0.05] text-[13px]" />
            </Field>
            <SelectField label="Ano (cadastro)" value={filters.ano} onChange={(v) => set('ano', v)} options={optionsAno} />
            <SelectFieldExplicit label="Mês (cadastro)" value={filters.mes} onChange={(v) => set('mes', v)}
              options={MESES.map((m, i) => ({ value: String(i + 1), label: m }))} />
            <SelectFieldExplicit label="Dia da semana (cadastro)" value={filters.diaSemana} onChange={(v) => set('diaSemana', v)}
              options={DIAS_SEMANA.map((d, i) => ({ value: String(i), label: d }))} />
            <SelectField label="DDD" value={filters.ddd} onChange={(v) => set('ddd', v)} options={optionsDDD} />
            <Field label="Letra inicial do nome">
              <input maxLength={1} value={filters.letraInicial}
                onChange={(e) => set('letraInicial', e.target.value)}
                placeholder="A–Z"
                className="w-full h-9 px-3 rounded-xl bg-[#0c0d10] border border-white/[0.05] text-[13px] uppercase" />
            </Field>
            <SelectFieldExplicit label="Período do agendamento" value={filters.periodoAgendamento}
              onChange={(v) => set('periodoAgendamento', v as Filters['periodoAgendamento'])}
              options={[
                { value: 'manha', label: 'Manhã (5–12h)' },
                { value: 'tarde', label: 'Tarde (12–18h)' },
                { value: 'noite', label: 'Noite (18–5h)' },
              ]} />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-3xl bg-[#15171b] border border-white/[0.05] overflow-hidden">
        <div className="max-h-[60vh] overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#0c0d10] sticky top-0 z-10">
              <tr className="text-[10px] uppercase tracking-wider text-white/45">
                <th className="text-left px-4 py-2.5 font-medium">Nome</th>
                <th className="text-left px-4 py-2.5 font-medium">Telefone</th>
                <th className="text-left px-4 py-2.5 font-medium">Origem</th>
                <th className="text-left px-4 py-2.5 font-medium">Tipo</th>
                <th className="text-left px-4 py-2.5 font-medium">Resp.</th>
                <th className="text-left px-4 py-2.5 font-medium">Agendou</th>
                <th className="text-left px-4 py-2.5 font-medium">Consulta</th>
                <th className="text-left px-4 py-2.5 font-medium">Fechou</th>
                <th className="text-left px-4 py-2.5 font-medium">Cadastro</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 500).map((l) => (
                <tr key={l.id} className="border-t border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-4 py-2 truncate max-w-[180px]">{l.nome}</td>
                  <td className="px-4 py-2 tabular-nums">{l.telefone}</td>
                  <td className="px-4 py-2 truncate max-w-[160px]">{l.origem}</td>
                  <td className="px-4 py-2">{l.tipo}</td>
                  <td className="px-4 py-2 truncate max-w-[120px]">{l.nomeResponsavel}</td>
                  <td className="px-4 py-2">{l.agendouConsulta ? 'Sim' : 'Não'}</td>
                  <td className="px-4 py-2">{l.temConsulta ? 'Sim' : '—'}</td>
                  <td className="px-4 py-2">{l.fechouTratamento === null || l.fechouTratamento === undefined ? '—' : l.fechouTratamento ? 'Sim' : 'Não'}</td>
                  <td className="px-4 py-2 tabular-nums text-white/55">
                    {new Date(l.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && !loading && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-white/45 text-sm">
                    Nenhum lead encontrado com esses filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {filtered.length > 500 && (
            <p className="text-center text-[11px] text-white/45 py-3">
              Exibindo 500 de {filtered.length} resultados. Refine os filtros.
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] uppercase tracking-wider text-white/55">{label}</label>
      {children}
    </div>
  )
}

function SelectField({
  label, value, onChange, options,
}: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <Field label={label}>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        style={{ colorScheme: 'dark' }}
        className={cn('w-full h-9 px-3 rounded-xl bg-[#0c0d10] border border-white/[0.05] text-[13px]')}>
        <option value="">Todos</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </Field>
  )
}

function SelectFieldExplicit({
  label, value, onChange, options,
}: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <Field label={label}>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        style={{ colorScheme: 'dark' }}
        className="w-full h-9 px-3 rounded-xl bg-[#0c0d10] border border-white/[0.05] text-[13px]">
        <option value="">Todos</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </Field>
  )
}

function TriField({
  label, value, onChange,
}: { label: string; value: Tri; onChange: (v: Tri) => void }) {
  return (
    <Field label={label}>
      <select value={value} onChange={(e) => onChange(e.target.value as Tri)}
        style={{ colorScheme: 'dark' }}
        className="w-full h-9 px-3 rounded-xl bg-[#0c0d10] border border-white/[0.05] text-[13px]">
        <option value="">Todos</option>
        <option value="sim">Sim</option>
        <option value="nao">Não</option>
      </select>
    </Field>
  )
}
