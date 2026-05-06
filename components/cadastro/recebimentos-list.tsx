'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Wallet } from 'lucide-react'
import { useCadastroStore } from '@/lib/cadastro-store'
import type { Recebimento } from '@/types'
import { cn } from '@/lib/utils'

interface RecebimentosListProps {
  onBack: () => void
}

interface Row {
  id: string
  origem: 'Consulta' | 'Tratamento'
  origemLabel: string
  formaPagamento: string
  valor: number
  data: string
}

const formaTone: Record<string, { bg: string; text: string; dot: string }> = {
  default: { bg: 'bg-white/[0.04]', text: 'text-white/75', dot: 'bg-white/45' },
  Pix: { bg: 'bg-cyan-500/10', text: 'text-cyan-300', dot: 'bg-cyan-400' },
  Cartão: { bg: 'bg-sky-500/10', text: 'text-sky-300', dot: 'bg-sky-400' },
  'Cartão Crédito': { bg: 'bg-sky-500/10', text: 'text-sky-300', dot: 'bg-sky-400' },
  'Cartão Débito': { bg: 'bg-blue-500/10', text: 'text-blue-300', dot: 'bg-blue-400' },
  Dinheiro: { bg: 'bg-emerald-500/10', text: 'text-emerald-300', dot: 'bg-emerald-400' },
  Boleto: { bg: 'bg-amber-500/10', text: 'text-amber-300', dot: 'bg-amber-400' },
}

function brl(n: number): string {
  return n.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

export function RecebimentosList({ onBack }: RecebimentosListProps) {
  const store = useCadastroStore()

  const rows: Row[] = useMemo(() => {
    const fromConsultas: Row[] = store.consultas.flatMap((c) => {
      const lead = store.leads.find((l) => l.id === c.leadId)
      return c.recebimentos.map<Row>((r: Recebimento) => ({
        id: r.id,
        origem: 'Consulta',
        origemLabel: lead?.nome ?? 'Consulta sem lead',
        formaPagamento: r.formaPagamento,
        valor: r.valorRecebimento,
        data: r.dataRecebimento,
      }))
    })
    const fromTratamentos: Row[] = store.tratamentos.flatMap((t) => {
      const consulta = store.consultas.find((c) => c.id === t.consultaId)
      const lead = consulta ? store.leads.find((l) => l.id === consulta.leadId) : undefined
      return t.recebimentos.map<Row>((r: Recebimento) => ({
        id: r.id,
        origem: 'Tratamento',
        origemLabel: `${lead?.nome ?? 'Tratamento'} — ${t.planoTratamento}`,
        formaPagamento: r.formaPagamento,
        valor: r.valorRecebimento,
        data: r.dataRecebimento,
      }))
    })
    return [...fromConsultas, ...fromTratamentos].sort((a, b) =>
      a.data < b.data ? 1 : a.data > b.data ? -1 : 0,
    )
  }, [store])

  const total = rows.reduce((sum, r) => sum + r.valor, 0)
  const byForma = rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.formaPagamento] = (acc[r.formaPagamento] ?? 0) + r.valor
    return acc
  }, {})
  const formasUsadas = Object.entries(byForma)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)

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

      {/* Hero with total */}
      <div
        className="rounded-3xl p-7 mb-5 text-cyan-50 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0e7490 60%, #075985 100%)' }}
      >
        <div className="flex items-start gap-5">
          <div className="h-12 w-12 rounded-2xl bg-white/15 grid place-items-center shrink-0">
            <Wallet className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-[12px] uppercase tracking-[0.2em] text-cyan-100/85 mb-1">Financeiro</p>
            <h1 className="text-[28px] font-bold tracking-tight leading-none">Recebimentos</h1>
            <p className="text-[13px] text-cyan-100/85 mt-2">
              {rows.length} {rows.length === 1 ? 'recebimento' : 'recebimentos'} registrados.
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-100/75">Total recebido</p>
            <p className="text-[36px] font-bold tabular-nums leading-none mt-1">{brl(total)}</p>
          </div>
        </div>
      </div>

      {/* Per-forma cards (Bento mini) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {formasUsadas.length === 0
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-3xl bg-[#15171b] border border-white/[0.05] p-5">
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/35">—</p>
                <p className="text-[24px] font-bold tabular-nums text-white/35 mt-2">{brl(0)}</p>
              </div>
            ))
          : formasUsadas.map(([forma, valor]) => {
              const tone = formaTone[forma] ?? formaTone.default
              const pct = total > 0 ? Math.round((valor / total) * 100) : 0
              return (
                <div key={forma} className="rounded-3xl bg-[#15171b] border border-white/[0.05] p-5">
                  <div className={cn('inline-flex items-center gap-1.5 px-2 h-5 rounded-md', tone.bg)}>
                    <span className={cn('h-1.5 w-1.5 rounded-full', tone.dot)} />
                    <span className={cn('text-[11px] font-semibold', tone.text)}>{forma}</span>
                  </div>
                  <p className="text-[24px] font-bold tabular-nums mt-3 leading-none">{brl(valor)}</p>
                  <p className="text-[11px] text-white/45 mt-2 tabular-nums">{pct}% do total</p>
                </div>
              )
            })}
      </div>

      {/* Table */}
      <div className="rounded-3xl bg-[#15171b] border border-white/[0.05] overflow-hidden">
        {rows.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-base text-white/85 font-medium mb-1">Nenhum recebimento ainda</p>
            <p className="text-sm text-white/55">
              Os recebimentos cadastrados em consultas e tratamentos aparecem aqui.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/[0.05]">
                <tr className="text-[10px] uppercase tracking-wider text-white/45">
                  <th className="text-left px-5 py-3 font-medium">Origem</th>
                  <th className="text-left px-5 py-3 font-medium">Forma</th>
                  <th className="text-right px-5 py-3 font-medium">Valor</th>
                  <th className="text-right px-5 py-3 font-medium">Data</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const tone = formaTone[r.formaPagamento] ?? formaTone.default
                  return (
                    <motion.tr
                      key={r.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.18, delay: Math.min(i * 0.02, 0.4) }}
                      className="border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-5 py-3">
                        <p className="text-white font-medium">{r.origemLabel}</p>
                        <p className="text-[10px] uppercase tracking-wider text-white/45 mt-0.5">{r.origem}</p>
                      </td>
                      <td className="px-5 py-3">
                        <span className={cn('inline-flex items-center gap-1.5 px-2 h-6 rounded-md', tone.bg)}>
                          <span className={cn('h-1.5 w-1.5 rounded-full', tone.dot)} />
                          <span className={cn('text-[11px] font-semibold', tone.text)}>{r.formaPagamento}</span>
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right text-cyan-300 font-semibold tabular-nums">
                        {brl(r.valor)}
                      </td>
                      <td className="px-5 py-3 text-right text-white/55 tabular-nums text-xs">
                        {r.data ? new Date(r.data).toLocaleDateString('pt-BR') : '—'}
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  )
}
