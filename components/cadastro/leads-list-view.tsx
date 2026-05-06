'use client'

import { memo, useDeferredValue, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ChevronLeft, ChevronRight, Pencil, Trash2, Search, UserPlus, Users } from 'lucide-react'
import { deleteLead } from '@/lib/cadastro-store'
import { useMergedLeads } from '@/lib/leads-merged'
import { cn } from '@/lib/utils'
import type { Lead } from '@/types'

const PAGE_SIZE = 100

interface LeadsListViewProps {
  onBack: () => void
  onEdit: (lead: Lead) => void
  onCreateNew: () => void
  onOpen: (lead: Lead) => void
}

function formatPhone(p: string): string {
  return p
}

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

function formatDate(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return dateFormatter.format(d)
}

interface IndexedLead {
  lead: Lead
  search: string
}

export function LeadsListView({ onBack, onEdit, onCreateNew, onOpen }: LeadsListViewProps) {
  const { leads, loading, error } = useMergedLeads()
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)
  const [statusFilter, setStatusFilter] = useState<'todos' | 'agendados' | 'nao_agendados'>('todos')
  const [page, setPage] = useState(0)

  // Índice de busca pré-computado: junta os campos pesquisáveis em um único string lowercase.
  const indexed = useMemo<IndexedLead[]>(
    () =>
      leads.map((l) => ({
        lead: l,
        search: `${l.nome} ${l.telefone} ${l.origem} ${l.nomeResponsavel}`.toLowerCase(),
      })),
    [leads],
  )

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase()
    const out: Lead[] = []
    for (const i of indexed) {
      if (statusFilter === 'agendados' && !i.lead.agendouConsulta) continue
      if (statusFilter === 'nao_agendados' && i.lead.agendouConsulta) continue
      if (q && !i.search.includes(q)) continue
      out.push(i.lead)
    }
    return out
  }, [indexed, deferredQuery, statusFilter])

  // Reset page sempre que filtros mudarem.
  useEffect(() => {
    setPage(0)
  }, [deferredQuery, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const pageStart = safePage * PAGE_SIZE
  const pageEnd = Math.min(pageStart + PAGE_SIZE, filtered.length)
  const pageRows = useMemo(() => filtered.slice(pageStart, pageEnd), [filtered, pageStart, pageEnd])

  const handleDelete = (lead: Lead) => {
    if (!confirm(`Apagar o lead "${lead.nome}"? Esta ação não pode ser desfeita.`)) return
    deleteLead(lead.id)
  }

  return (
    <motion.div
      className="px-8 py-8 max-w-6xl mx-auto"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={onBack}
          className="group inline-flex items-center gap-2 px-3 h-9 rounded-xl bg-[#15171b] border border-white/[0.05] text-[13px] text-white/70 hover:text-white hover:border-white/[0.12] transition-colors"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Voltar para Dashboard
        </button>
      </div>

      <div
        className="rounded-3xl p-7 mb-5 text-cyan-50"
        style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0e7490 60%, #075985 100%)' }}
      >
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-white/15 grid place-items-center">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-[12px] uppercase tracking-[0.2em] text-cyan-100/85 mb-1">Cadastros</p>
            <h1 className="text-[28px] font-bold tracking-tight leading-none">
              Leads ({loading ? '…' : leads.length})
            </h1>
            <p className="text-[13px] text-cyan-100/85 mt-2">
              {error
                ? `Mostrando apenas dados locais — ${error}`
                : 'Gerencie, edite e remova os leads cadastrados.'}
            </p>
          </div>
          <button
            onClick={onCreateNew}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-2xl bg-white text-cyan-700 font-semibold text-[13px] hover:bg-cyan-50 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            Novo Lead
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-3xl bg-[#15171b] border border-white/[0.05] p-4 flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome, telefone, origem, responsável…"
            className="w-full h-10 pl-10 pr-3 rounded-xl bg-[#0c0d10] border border-white/[0.05] text-sm placeholder:text-white/35 focus:outline-none focus:border-cyan-400/55"
          />
        </div>
        <div className="inline-flex items-center rounded-xl border border-white/[0.05] bg-[#0c0d10] p-0.5">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'agendados', label: 'Agendados' },
            { id: 'nao_agendados', label: 'Não agendados' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id as typeof statusFilter)}
              className={cn(
                'h-8 px-3 rounded-lg text-[12px] font-medium transition-colors',
                statusFilter === f.id ? 'bg-cyan-400 text-slate-900 font-semibold' : 'text-white/55 hover:text-white',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-3xl bg-[#15171b] border border-white/[0.05] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-base text-white/85 font-medium mb-1">Nenhum lead encontrado</p>
            <p className="text-sm text-white/55">
              {leads.length === 0
                ? loading
                  ? 'Carregando leads…'
                  : 'Cadastre seu primeiro lead clicando em "Novo Lead" acima.'
                : 'Ajuste a busca ou os filtros para encontrar o que você procura.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/[0.05]">
                <tr className="text-[10px] uppercase tracking-wider text-white/45">
                  <th className="text-left px-5 py-3 font-medium">Nome</th>
                  <th className="text-left px-5 py-3 font-medium">Telefone</th>
                  <th className="text-left px-5 py-3 font-medium">Origem</th>
                  <th className="text-left px-5 py-3 font-medium">Tipo</th>
                  <th className="text-left px-5 py-3 font-medium">Responsável</th>
                  <th className="text-left px-5 py-3 font-medium">Cadastrado</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-right px-5 py-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((l) => (
                  <LeadRow
                    key={l.id}
                    lead={l}
                    onOpen={onOpen}
                    onEdit={onEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {filtered.length > PAGE_SIZE && (
        <div className="mt-4 flex items-center justify-between gap-3 px-1">
          <p className="text-[12px] text-white/55 tabular-nums">
            Mostrando {pageStart + 1}–{pageEnd} de {filtered.length}
            {filtered.length !== leads.length && ` (filtrados de ${leads.length})`}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={safePage === 0}
              className="inline-flex items-center gap-1 h-9 px-3 rounded-xl bg-[#15171b] border border-white/[0.05] text-[12px] text-white/70 hover:text-white hover:border-white/[0.12] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Anterior
            </button>
            <span className="text-[12px] text-white/55 tabular-nums px-2">
              {safePage + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={safePage >= totalPages - 1}
              className="inline-flex items-center gap-1 h-9 px-3 rounded-xl bg-[#15171b] border border-white/[0.05] text-[12px] text-white/70 hover:text-white hover:border-white/[0.12] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Próxima
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}

interface LeadRowProps {
  lead: Lead
  onOpen: (lead: Lead) => void
  onEdit: (lead: Lead) => void
  onDelete: (lead: Lead) => void
}

const LeadRow = memo(function LeadRow({ lead: l, onOpen, onEdit, onDelete }: LeadRowProps) {
  return (
    <tr
      onClick={() => onOpen(l)}
      className="border-b border-white/[0.04] last:border-b-0 hover:bg-cyan-500/[0.05] transition-colors cursor-pointer group"
    >
      <td className="px-5 py-3 text-white font-medium">
        <span className="group-hover:text-cyan-200 transition-colors">{l.nome}</span>
      </td>
      <td className="px-5 py-3 text-white/75 tabular-nums">{formatPhone(l.telefone)}</td>
      <td className="px-5 py-3 text-white/75">{l.origem}</td>
      <td className="px-5 py-3">
        <span
          className={cn(
            'inline-flex px-2 h-5 items-center rounded-md text-[11px] font-semibold',
            l.tipo === 'Cadastro'
              ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-400/20'
              : 'bg-amber-500/10 text-amber-300 border border-amber-400/20',
          )}
        >
          {l.tipo}
        </span>
      </td>
      <td className="px-5 py-3 text-white/75">{l.nomeResponsavel}</td>
      <td className="px-5 py-3 text-white/55">{formatDate(l.createdAt)}</td>
      <td className="px-5 py-3">
        {l.agendouConsulta ? (
          <span className="inline-flex px-2 h-5 items-center rounded-md text-[11px] text-emerald-300 bg-emerald-500/10 border border-emerald-400/20">
            Agendou
          </span>
        ) : (
          <span className="inline-flex px-2 h-5 items-center rounded-md text-[11px] text-white/55 bg-white/[0.04] border border-white/[0.05]">
            Não agendou
          </span>
        )}
      </td>
      <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => onEdit(l)}
            className="h-8 w-8 grid place-items-center rounded-lg text-white/55 hover:text-cyan-300 hover:bg-cyan-500/[0.08] transition-colors"
            title="Editar"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(l)}
            className="h-8 w-8 grid place-items-center rounded-lg text-white/55 hover:text-rose-300 hover:bg-rose-500/[0.08] transition-colors"
            title="Apagar"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  )
})
