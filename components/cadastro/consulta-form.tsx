'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ClipboardPlus, CheckCircle2, AlertCircle, User as UserIcon, Phone, UserCog } from 'lucide-react'
import { CadastroFormShell } from './form-shell'
import { TextInput, SelectInput, TextareaInput, ToggleSwitch } from './form-fields'
import { RecebimentosEditor, type RecebimentoInput } from './recebimentos-editor'
import { addConsulta, useCadastroStore } from '@/lib/cadastro-store'
import { MOTIVOS_NAO_FECHAMENTO_DEFAULT, type Consulta, type CorSemaforo, type Lead } from '@/types'

interface ConsultaFormProps {
  onBack: () => void
  onSaved?: (consulta: Consulta) => void
  prefilledLeadId?: string
}

interface FormState {
  leadId: string
  valorConsulta: number
  pagamentoAntecipado: boolean
  recebimentos: RecebimentoInput[]
  tratamentoIndicado: string
  orcamento: number
  compareceu: boolean
  fechouTratamento: boolean
  motivoNaoFechamento: string
}

const initialState: FormState = {
  leadId: '',
  valorConsulta: 0,
  pagamentoAntecipado: false,
  recebimentos: [],
  tratamentoIndicado: '',
  orcamento: 0,
  compareceu: true,
  fechouTratamento: false,
  motivoNaoFechamento: '',
}

const corClasses: Record<CorSemaforo, string> = {
  verde: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]',
  amarelo: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]',
  vermelho: 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]',
}

function SemaforoDot({ cor }: { cor: CorSemaforo }) {
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${corClasses[cor]}`} aria-hidden />
}

function LeadCard({ lead }: { lead: Lead }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-cyan-400/30 bg-cyan-500/[0.05] p-4"
    >
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-cyan-300 font-semibold mb-3">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Lead vinculado a esta consulta
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <UserIcon className="h-4 w-4 text-cyan-300/80 shrink-0" />
          <div>
            <div className="text-xs text-muted-foreground">Nome</div>
            <div className="font-medium text-foreground">{lead.nome}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-cyan-300/80 shrink-0" />
          <div>
            <div className="text-xs text-muted-foreground">Telefone</div>
            <div className="font-medium text-foreground">{lead.telefone}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <UserCog className="h-4 w-4 text-cyan-300/80 shrink-0" />
          <div>
            <div className="text-xs text-muted-foreground">Responsável</div>
            <div className="font-medium text-foreground">{lead.nomeResponsavel}</div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function ConsultaForm({ onBack, onSaved, prefilledLeadId }: ConsultaFormProps) {
  const store = useCadastroStore()
  const usedLeadIds = useMemo(() => new Set(store.consultas.map((c) => c.leadId)), [store.consultas])

  const availableLeads = useMemo(
    () =>
      store.leads.filter((l) => !usedLeadIds.has(l.id) || l.id === prefilledLeadId),
    [store.leads, usedLeadIds, prefilledLeadId],
  )

  const [data, setData] = useState<FormState>({
    ...initialState,
    leadId: prefilledLeadId ?? '',
  })
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; msg: string } | null>(null)

  const selectedLead = useMemo(
    () => store.leads.find((l) => l.id === data.leadId) ?? null,
    [store.leads, data.leadId],
  )

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setData((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFeedback(null)
    if (!data.leadId) {
      setFeedback({ kind: 'error', msg: 'Selecione o lead.' })
      return
    }
    if (!data.fechouTratamento && !data.motivoNaoFechamento.trim()) {
      setFeedback({ kind: 'error', msg: 'Informe o motivo do não fechamento do tratamento.' })
      return
    }
    if (data.recebimentos.length > 2) {
      setFeedback({ kind: 'error', msg: 'Consulta aceita no máximo 2 recebimentos.' })
      return
    }
    try {
      const consulta = addConsulta({
        leadId: data.leadId,
        valorConsulta: data.valorConsulta,
        pagamentoAntecipado: data.pagamentoAntecipado,
        recebimentos: data.recebimentos,
        tratamentoIndicado: data.tratamentoIndicado,
        orcamento: data.orcamento,
        compareceu: data.compareceu,
        fechouTratamento: data.fechouTratamento,
        motivoNaoFechamento: data.motivoNaoFechamento,
      })
      const leadName = store.leads.find((l) => l.id === consulta.leadId)?.nome ?? 'lead'
      setFeedback({ kind: 'success', msg: `Consulta cadastrada para ${leadName}.` })
      setData({ ...initialState })
      onSaved?.(consulta)
    } catch (err) {
      setFeedback({
        kind: 'error',
        msg: err instanceof Error ? err.message : 'Erro inesperado ao cadastrar.',
      })
    }
  }

  if (availableLeads.length === 0) {
    return (
      <CadastroFormShell
        title="Cadastrar Consulta"
        description="Cada consulta é vinculada a um lead já cadastrado."
        icon={ClipboardPlus}
        accent="#a78bfa"
        onBack={onBack}
      >
        <div className="text-center py-12 px-4 rounded-xl border border-dashed border-white/10">
          <p className="text-base text-foreground font-medium mb-2">Nenhum lead disponível</p>
          <p className="text-sm text-muted-foreground">
            Cadastre primeiro um lead para então registrar a consulta dele.
          </p>
        </div>
      </CadastroFormShell>
    )
  }

  return (
    <CadastroFormShell
      title="Cadastrar Consulta"
      description="Consulta — vincula-se a um lead e pode gerar tratamento."
      icon={ClipboardPlus}
      accent="#a78bfa"
      onBack={onBack}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {selectedLead ? (
          <LeadCard lead={selectedLead} />
        ) : (
          <SelectInput
            label="Lead"
            value={data.leadId}
            onChange={(e) => set('leadId', e.target.value)}
            options={availableLeads.map((l) => ({
              value: l.id,
              label: `${l.nome} — ${l.telefone}`,
            }))}
            placeholder="Selecione um lead…"
            required
            hint="Apenas leads ainda sem consulta aparecem aqui."
          />
        )}

        <ToggleSwitch
          label="Compareceu na consulta?"
          description="Marque se o lead realmente apareceu no horário marcado"
          checked={data.compareceu}
          onChange={(v) => set('compareceu', v)}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput
            label="Valor da consulta"
            type="number"
            min={0}
            step="0.01"
            value={data.valorConsulta}
            onChange={(e) => set('valorConsulta', Number(e.target.value))}
            placeholder="0,00"
            required
          />
          <TextInput
            label="Orçamento do tratamento"
            type="number"
            min={0}
            step="0.01"
            value={data.orcamento}
            onChange={(e) => set('orcamento', Number(e.target.value))}
            placeholder="0,00"
            required
          />
        </div>

        <TextareaInput
          label="Tratamento indicado"
          placeholder="Descreva o tratamento sugerido…"
          value={data.tratamentoIndicado}
          onChange={(e) => set('tratamentoIndicado', e.target.value)}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ToggleSwitch
            label="Pagamento antecipado?"
            description="Pagou antes da consulta"
            checked={data.pagamentoAntecipado}
            onChange={(v) => set('pagamentoAntecipado', v)}
          />
          <ToggleSwitch
            label="Fechou tratamento?"
            description="Aceitou seguir com o tratamento"
            checked={data.fechouTratamento}
            onChange={(v) => set('fechouTratamento', v)}
          />
        </div>

        {!data.fechouTratamento && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            <label className="block text-xs uppercase tracking-wide text-muted-foreground font-semibold">
              Motivo do não fechamento
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {MOTIVOS_NAO_FECHAMENTO_DEFAULT.map((m) => {
                const active = data.motivoNaoFechamento === m.nome
                return (
                  <button
                    type="button"
                    key={m.nome}
                    onClick={() => set('motivoNaoFechamento', m.nome)}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                      active
                        ? 'border-purple-400/60 bg-purple-500/10 text-foreground'
                        : 'border-white/10 bg-white/[0.02] text-muted-foreground hover:border-white/20 hover:text-foreground'
                    }`}
                  >
                    <SemaforoDot cor={m.cor} />
                    <span className="flex-1">{m.nome}</span>
                  </button>
                )
              })}
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              Não achou o motivo? Vá em <strong>Configurações da empresa</strong> para adicionar mais.
            </p>
          </motion.div>
        )}

        <RecebimentosEditor
          value={data.recebimentos}
          onChange={(v) => set('recebimentos', v)}
          max={2}
        />

        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className={
              feedback.kind === 'success'
                ? 'flex items-start gap-2 p-3 rounded-lg border border-emerald-400/30 bg-emerald-500/10 text-emerald-300 text-sm'
                : 'flex items-start gap-2 p-3 rounded-lg border border-red-400/30 bg-red-500/10 text-red-300 text-sm'
            }
          >
            {feedback.kind === 'success' ? (
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            )}
            <span>{feedback.msg}</span>
          </motion.div>
        )}

        <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-white/5">
          <button
            type="button"
            onClick={() => {
              setData({ ...initialState, leadId: prefilledLeadId ?? '' })
              setFeedback(null)
            }}
            className="px-4 py-2.5 rounded-lg border border-white/10 bg-white/[0.03] text-sm text-muted-foreground hover:text-foreground hover:border-white/20 transition-colors"
          >
            Limpar
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-[#0d0f14] bg-gradient-to-r from-purple-400 to-fuchsia-500 shadow-[0_0_24px_rgba(167,139,250,0.35)] hover:from-purple-300 hover:to-fuchsia-400 transition-all"
          >
            Cadastrar Consulta
          </button>
        </div>
      </form>
    </CadastroFormShell>
  )
}
