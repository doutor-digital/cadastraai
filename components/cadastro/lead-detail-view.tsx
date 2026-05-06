'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Phone,
  Calendar,
  ClipboardCheck,
  HeartPulse,
  Wallet,
  CheckCircle2,
  XCircle,
  User as UserIcon,
  Sparkles,
} from 'lucide-react'
import { useCadastroStore, deleteLead } from '@/lib/cadastro-store'
import { cn } from '@/lib/utils'
import type { Consulta, Lead, Recebimento, Tratamento } from '@/types'

interface LeadDetailViewProps {
  leadId: string
  onBack: () => void
  onEdit: (lead: Lead) => void
  onEditConsulta?: (consulta: Consulta) => void
  onEditTratamento?: (tratamento: Tratamento) => void
  onDeleted: () => void
}

function brl(n: number): string {
  return n.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

function formatDate(iso?: string): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return '—'
  }
}

function formatDateTime(iso?: string): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '—'
  }
}

const formaTone: Record<string, { bg: string; text: string }> = {
  default: { bg: 'bg-white/[0.04]', text: 'text-white/75' },
  Pix: { bg: 'bg-cyan-500/10', text: 'text-cyan-300' },
  Cartão: { bg: 'bg-sky-500/10', text: 'text-sky-300' },
  'Cartão Crédito': { bg: 'bg-sky-500/10', text: 'text-sky-300' },
  'Cartão Débito': { bg: 'bg-blue-500/10', text: 'text-blue-300' },
  Dinheiro: { bg: 'bg-emerald-500/10', text: 'text-emerald-300' },
  Boleto: { bg: 'bg-amber-500/10', text: 'text-amber-300' },
}

interface RowProps {
  label: string
  value: React.ReactNode
  span?: 1 | 2
}

function InfoRow({ label, value, span = 1 }: RowProps) {
  return (
    <div className={cn(span === 2 && 'sm:col-span-2')}>
      <p className="text-[11px] uppercase tracking-wider text-white/45">{label}</p>
      <p className="text-[14px] text-white mt-0.5">{value}</p>
    </div>
  )
}

function YesNo({ value }: { value: boolean }) {
  return value ? (
    <span className="inline-flex items-center gap-1.5 text-cyan-300">
      <CheckCircle2 className="h-4 w-4" />
      Sim
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-white/55">
      <XCircle className="h-4 w-4" />
      Não
    </span>
  )
}

export function LeadDetailView({
  leadId,
  onBack,
  onEdit,
  onEditConsulta,
  onEditTratamento,
  onDeleted,
}: LeadDetailViewProps) {
  const store = useCadastroStore()

  const lead = useMemo(() => store.leads.find((l) => l.id === leadId), [store.leads, leadId])
  const consulta = useMemo(
    () => store.consultas.find((c) => c.leadId === leadId),
    [store.consultas, leadId],
  )
  const tratamento = useMemo(
    () => (consulta ? store.tratamentos.find((t) => t.consultaId === consulta.id) : undefined),
    [store.tratamentos, consulta],
  )

  const allRecebimentos: Recebimento[] = useMemo(() => {
    const list: Recebimento[] = []
    if (consulta) list.push(...consulta.recebimentos)
    if (tratamento) list.push(...tratamento.recebimentos)
    return list.sort((a, b) => (a.dataRecebimento < b.dataRecebimento ? 1 : -1))
  }, [consulta, tratamento])

  const totalRecebido = allRecebimentos.reduce((sum, r) => sum + r.valorRecebimento, 0)

  if (!lead) {
    return (
      <motion.div
        className="px-8 py-8 max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={onBack}
            className="group inline-flex items-center gap-2 px-3 h-9 rounded-xl bg-[#15171b] border border-white/[0.05] text-[13px] text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>
        </div>
        <div className="rounded-3xl bg-[#15171b] border border-white/[0.05] px-6 py-16 text-center">
          <p className="text-base text-white/85 font-medium mb-1">Lead não encontrado</p>
          <p className="text-sm text-white/55">Pode ter sido removido recentemente.</p>
        </div>
      </motion.div>
    )
  }

  const handleDelete = () => {
    if (!confirm(`Apagar o lead "${lead.nome}"? Esta ação não pode ser desfeita.`)) return
    deleteLead(lead.id)
    onDeleted()
  }

  const initials = lead.nome
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <motion.div
      className="px-8 py-8 max-w-5xl mx-auto"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Top actions */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={onBack}
          className="group inline-flex items-center gap-2 px-3 h-9 rounded-xl bg-[#15171b] border border-white/[0.05] text-[13px] text-white/70 hover:text-white hover:border-white/[0.12] transition-colors"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Voltar para Leads
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(lead)}
            className="inline-flex items-center gap-1.5 px-3 h-9 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-900 font-semibold text-[13px] transition-colors"
          >
            <Pencil className="h-4 w-4" />
            Editar
          </button>
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 px-3 h-9 rounded-xl bg-rose-500/[0.08] border border-rose-400/30 text-rose-300 hover:bg-rose-500/15 text-[13px] transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Apagar
          </button>
        </div>
      </div>

      {/* Hero */}
      <div
        className="rounded-3xl p-7 mb-5 text-cyan-50"
        style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0e7490 60%, #075985 100%)' }}
      >
        <div className="flex items-start gap-5">
          <div className="h-20 w-20 rounded-2xl grid place-items-center text-white text-[26px] font-bold shrink-0"
            style={{
              background: 'rgba(8, 47, 73, 0.55)',
              boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.18)',
            }}
          >
            {initials || <UserIcon className="h-9 w-9" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] uppercase tracking-[0.2em] text-cyan-100/85 mb-1">Detalhes do Lead</p>
            <h1 className="text-[32px] font-bold tracking-tight leading-none">{lead.nome}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-[13px] text-cyan-100/85">
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                {lead.telefone}
              </span>
              <span className="text-cyan-100/45">·</span>
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Origem: {lead.origem}
              </span>
              <span className="text-cyan-100/45">·</span>
              <span className="inline-flex items-center gap-1.5">
                <UserIcon className="h-3.5 w-3.5" />
                {lead.nomeResponsavel}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <span
              className={cn(
                'px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm',
                lead.tipo === 'Cadastro'
                  ? 'bg-white/20 text-white'
                  : 'bg-amber-400/30 text-amber-50',
              )}
            >
              {lead.tipo}
            </span>
            {lead.agendouConsulta ? (
              <span className="px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-emerald-400/30 text-emerald-50 backdrop-blur-sm">
                Agendou
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-white/10 text-white/85 backdrop-blur-sm">
                Não agendou
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Cadastro details */}
      <div className="rounded-3xl bg-[#15171b] border border-white/[0.05] p-6 mb-4">
        <h3 className="text-[14px] font-semibold mb-5 flex items-center gap-2">
          <UserIcon className="h-4 w-4 text-cyan-400" />
          Informações do cadastro
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <InfoRow label="Nome" value={lead.nome} />
          <InfoRow label="Telefone" value={lead.telefone} />
          <InfoRow label="Origem" value={lead.origem} />
          <InfoRow label="Responsável" value={lead.nomeResponsavel} />
          <InfoRow label="Tipo" value={lead.tipo} />
          {lead.tipo === 'Resgate' && lead.tipoResgate && (
            <InfoRow label="Tipo de resgate" value={lead.tipoResgate} />
          )}
          <InfoRow label="Houve interação?" value={<YesNo value={lead.interacao} />} />
          <InfoRow label="Agendou consulta?" value={<YesNo value={lead.agendouConsulta} />} />
          <InfoRow label="Pagamento antecipado?" value={<YesNo value={lead.pagamentoAntecipado} />} />
          <InfoRow label="Cadastrado em" value={formatDateTime(lead.createdAt)} />
          {lead.agendouConsulta && lead.dataAgendamento && (
            <InfoRow label="Data do agendamento" value={formatDateTime(lead.dataAgendamento)} span={2} />
          )}
          {!lead.agendouConsulta && lead.motivoNaoAgendamento && (
            <InfoRow label="Motivo do não agendamento" value={lead.motivoNaoAgendamento} span={2} />
          )}
        </div>
      </div>

      {/* Funnel state */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        <FunnelStep
          icon={Calendar}
          label="Agendamento"
          done={lead.agendouConsulta}
          detail={lead.agendouConsulta ? formatDate(lead.dataAgendamento) : 'Não agendou'}
          onClick={() => onEdit(lead)}
          actionLabel="Editar dados do agendamento"
        />
        <FunnelStep
          icon={ClipboardCheck}
          label="Consulta"
          done={Boolean(consulta)}
          detail={consulta ? formatDate(consulta.createdAt) : 'Sem consulta'}
          onClick={consulta && onEditConsulta ? () => onEditConsulta(consulta) : undefined}
          actionLabel={consulta ? 'Editar consulta' : 'Sem consulta para editar'}
        />
        <FunnelStep
          icon={HeartPulse}
          label="Tratamento"
          done={Boolean(tratamento)}
          detail={tratamento ? tratamento.planoTratamento : 'Sem tratamento'}
          onClick={tratamento && onEditTratamento ? () => onEditTratamento(tratamento) : undefined}
          actionLabel={tratamento ? 'Editar tratamento' : 'Sem tratamento para editar'}
        />
      </div>

      {/* Consulta */}
      {consulta && (
        <div className="rounded-3xl bg-[#15171b] border border-white/[0.05] p-6 mb-4">
          <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
            <h3 className="text-[14px] font-semibold flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-cyan-400" />
              Consulta vinculada
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-white/45 tabular-nums">
                {formatDate(consulta.createdAt)}
              </span>
              {onEditConsulta && (
                <button
                  onClick={() => onEditConsulta(consulta)}
                  className="inline-flex items-center gap-1.5 px-3 h-8 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-900 font-semibold text-[12px] transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Editar consulta
                </button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <InfoRow label="Valor da consulta" value={brl(consulta.valorConsulta)} />
            <InfoRow label="Orçamento" value={brl(consulta.orcamento)} />
            <InfoRow label="Pagamento antecipado?" value={<YesNo value={consulta.pagamentoAntecipado} />} />
            <InfoRow label="Fechou tratamento?" value={<YesNo value={consulta.fechouTratamento} />} />
            <InfoRow label="Tratamento indicado" value={consulta.tratamentoIndicado || '—'} span={2} />
            {!consulta.fechouTratamento && consulta.motivoNaoFechamento && (
              <InfoRow label="Motivo do não fechamento" value={consulta.motivoNaoFechamento} span={2} />
            )}
          </div>
        </div>
      )}

      {/* Tratamento */}
      {tratamento && (
        <div className="rounded-3xl bg-[#15171b] border border-white/[0.05] p-6 mb-4">
          <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
            <h3 className="text-[14px] font-semibold flex items-center gap-2">
              <HeartPulse className="h-4 w-4 text-cyan-400" />
              Tratamento fechado
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-white/45 tabular-nums">
                {formatDate(tratamento.createdAt)}
              </span>
              {onEditTratamento && (
                <button
                  onClick={() => onEditTratamento(tratamento)}
                  className="inline-flex items-center gap-1.5 px-3 h-8 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-900 font-semibold text-[12px] transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Editar tratamento
                </button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <InfoRow label="Plano de tratamento" value={tratamento.planoTratamento} />
            <InfoRow label="Valor do plano" value={brl(tratamento.valorPlano)} />
            {tratamento.planoPilates && <InfoRow label="Pilates" value={tratamento.planoPilates} />}
            {tratamento.musculacao && <InfoRow label="Musculação" value={tratamento.musculacao} />}
            {tratamento.procedimento && <InfoRow label="Procedimento" value={tratamento.procedimento} span={2} />}
          </div>
        </div>
      )}

      {/* Recebimentos */}
      {allRecebimentos.length > 0 && (
        <div className="rounded-3xl bg-[#15171b] border border-white/[0.05] overflow-hidden">
          <div className="px-6 h-14 flex items-center justify-between border-b border-white/[0.05]">
            <h3 className="text-[14px] font-semibold flex items-center gap-2">
              <Wallet className="h-4 w-4 text-cyan-400" />
              Recebimentos ({allRecebimentos.length})
            </h3>
            <span className="text-[13px] font-semibold tabular-nums text-cyan-300">
              {brl(totalRecebido)}
            </span>
          </div>
          <ul>
            {allRecebimentos.map((r, i) => {
              const tone = formaTone[r.formaPagamento] ?? formaTone.default
              const origem = consulta && consulta.recebimentos.some((rr) => rr.id === r.id) ? 'Consulta' : 'Tratamento'
              return (
                <li
                  key={r.id}
                  className={cn(
                    'flex items-center gap-3 px-6 h-14',
                    i < allRecebimentos.length - 1 && 'border-b border-white/[0.04]',
                  )}
                >
                  <span className={cn('inline-flex items-center px-2 h-6 rounded-md text-[11px] font-semibold', tone.bg, tone.text)}>
                    {r.formaPagamento}
                  </span>
                  <span className="text-[12px] text-white/55 uppercase tracking-wider">{origem}</span>
                  <span className="ml-auto text-[14px] font-semibold tabular-nums text-cyan-300">
                    {brl(r.valorRecebimento)}
                  </span>
                  <span className="text-[12px] text-white/55 tabular-nums w-24 text-right">
                    {formatDate(r.dataRecebimento)}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </motion.div>
  )
}

interface FunnelStepProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  done: boolean
  detail: string
  onClick?: () => void
  actionLabel?: string
}

function FunnelStep({ icon: Icon, label, done, detail, onClick, actionLabel }: FunnelStepProps) {
  const clickable = Boolean(onClick)
  const Wrapper: React.ElementType = clickable ? 'button' : 'div'
  return (
    <Wrapper
      type={clickable ? 'button' : undefined}
      onClick={onClick}
      aria-label={clickable ? actionLabel : undefined}
      className={cn(
        'group rounded-2xl p-4 border text-left w-full transition-colors',
        done
          ? 'border-cyan-400/30 bg-cyan-500/[0.06]'
          : 'border-white/[0.05] bg-[#15171b]',
        clickable && 'cursor-pointer hover:border-cyan-300/60 hover:bg-cyan-500/[0.10] focus:outline-none focus:ring-2 focus:ring-cyan-400/40',
        !clickable && 'cursor-default',
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn('h-4 w-4', done ? 'text-cyan-300' : 'text-white/45')} />
        <span className="text-[11px] uppercase tracking-wider text-white/45">{label}</span>
        {clickable && (
          <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-cyan-300/80 group-hover:text-cyan-200">
            <Pencil className="h-3 w-3" />
            Editar
          </span>
        )}
      </div>
      <p className={cn('text-[13px]', done ? 'text-white' : 'text-white/55')}>{detail}</p>
    </Wrapper>
  )
}
