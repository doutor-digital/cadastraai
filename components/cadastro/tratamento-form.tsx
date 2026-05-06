'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { HeartPulse, CheckCircle2, AlertCircle } from 'lucide-react'
import { CadastroFormShell } from './form-shell'
import { TextInput, SelectInput } from './form-fields'
import { RecebimentosEditor, type RecebimentoInput } from './recebimentos-editor'
import { addTratamento, useCadastroStore } from '@/lib/cadastro-store'
import { useConfig } from '@/lib/config-store'
import type { Tratamento } from '@/types'

interface TratamentoFormProps {
  onBack: () => void
  onSaved?: (tratamento: Tratamento) => void
  prefilledConsultaId?: string
}

interface FormState {
  consultaId: string
  planoTratamento: string
  planoPilates: string
  musculacao: string
  procedimento: string
  valorPlano: number
  recebimentos: RecebimentoInput[]
}

const initialState: FormState = {
  consultaId: '',
  planoTratamento: '',
  planoPilates: '',
  musculacao: '',
  procedimento: '',
  valorPlano: 0,
  recebimentos: [],
}

export function TratamentoForm({ onBack, onSaved, prefilledConsultaId }: TratamentoFormProps) {
  const store = useCadastroStore()
  const config = useConfig()
  const planoOptions = config.planosTratamento.map((p) => ({ value: p, label: p }))
  const usedConsultaIds = useMemo(() => new Set(store.tratamentos.map((t) => t.consultaId)), [store.tratamentos])

  const elegiveis = useMemo(
    () => store.consultas.filter((c) => c.fechouTratamento && !usedConsultaIds.has(c.id)),
    [store.consultas, usedConsultaIds],
  )

  const [data, setData] = useState<FormState>({ ...initialState, consultaId: prefilledConsultaId ?? '' })
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; msg: string } | null>(null)

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setData((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFeedback(null)
    if (!data.consultaId) {
      setFeedback({ kind: 'error', msg: 'Selecione a consulta vinculada.' })
      return
    }
    if (data.recebimentos.length > 6) {
      setFeedback({ kind: 'error', msg: 'Tratamento aceita no máximo 6 recebimentos.' })
      return
    }
    try {
      const tratamento = addTratamento({
        consultaId: data.consultaId,
        planoTratamento: data.planoTratamento,
        planoPilates: data.planoPilates || undefined,
        musculacao: data.musculacao || undefined,
        procedimento: data.procedimento || undefined,
        valorPlano: data.valorPlano,
        recebimentos: data.recebimentos,
      })
      setFeedback({ kind: 'success', msg: 'Tratamento cadastrado com sucesso.' })
      setData(initialState)
      onSaved?.(tratamento)
    } catch (err) {
      setFeedback({
        kind: 'error',
        msg: err instanceof Error ? err.message : 'Erro inesperado ao cadastrar.',
      })
    }
  }

  if (elegiveis.length === 0) {
    return (
      <CadastroFormShell
        title="Cadastrar Tratamento"
        description="Tratamento se vincula a uma consulta com tratamento fechado."
        icon={HeartPulse}
        accent="#34d399"
        onBack={onBack}
      >
        <div className="text-center py-12 px-4 rounded-xl border border-dashed border-white/10">
          <p className="text-base text-foreground font-medium mb-2">Nenhuma consulta elegível</p>
          <p className="text-sm text-muted-foreground">
            Cadastre uma consulta marcada como &quot;Fechou tratamento&quot; para registrar o tratamento.
          </p>
        </div>
      </CadastroFormShell>
    )
  }

  const consultaOptions = elegiveis.map((c) => {
    const lead = store.leads.find((l) => l.id === c.leadId)
    return {
      value: c.id,
      label: `${lead?.nome ?? 'Lead'} — orçamento R$ ${c.orcamento.toLocaleString('pt-BR')}`,
    }
  })

  return (
    <CadastroFormShell
      title="Cadastrar Tratamento"
      description="Tratamento fechado — registre plano, valores e recebimentos."
      icon={HeartPulse}
      accent="#34d399"
      onBack={onBack}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {prefilledConsultaId && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 p-3 rounded-lg border border-emerald-400/30 bg-emerald-500/[0.07] text-emerald-100 text-sm"
          >
            <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-emerald-300" />
            <span>
              Consulta recém-cadastrada já selecionada — finalize o tratamento logo abaixo.
            </span>
          </motion.div>
        )}
        <SelectInput
          label="Consulta vinculada"
          value={data.consultaId}
          onChange={(e) => set('consultaId', e.target.value)}
          options={consultaOptions}
          placeholder="Selecione uma consulta…"
          required
          hint="Apenas consultas com tratamento fechado e ainda sem tratamento aparecem aqui."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectInput
            label="Plano de tratamento"
            value={data.planoTratamento}
            onChange={(e) => set('planoTratamento', e.target.value)}
            options={planoOptions}
            placeholder="Selecione…"
            required
          />
          <TextInput
            label="Valor do plano"
            type="number"
            min={0}
            step="0.01"
            value={data.valorPlano}
            onChange={(e) => set('valorPlano', Number(e.target.value))}
            placeholder="0,00"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TextInput
            label="Plano de Pilates"
            placeholder="Opcional"
            value={data.planoPilates}
            onChange={(e) => set('planoPilates', e.target.value)}
          />
          <TextInput
            label="Musculação"
            placeholder="Opcional"
            value={data.musculacao}
            onChange={(e) => set('musculacao', e.target.value)}
          />
          <TextInput
            label="Procedimento"
            placeholder="Opcional"
            value={data.procedimento}
            onChange={(e) => set('procedimento', e.target.value)}
          />
        </div>

        <RecebimentosEditor
          value={data.recebimentos}
          onChange={(v) => set('recebimentos', v)}
          max={6}
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
              setData(initialState)
              setFeedback(null)
            }}
            className="px-4 py-2.5 rounded-lg border border-white/10 bg-white/[0.03] text-sm text-muted-foreground hover:text-foreground hover:border-white/20 transition-colors"
          >
            Limpar
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-[#0d0f14] bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-[0_0_24px_rgba(52,211,153,0.35)] hover:from-emerald-300 hover:to-emerald-400 transition-all"
          >
            Cadastrar Tratamento
          </button>
        </div>
      </form>
    </CadastroFormShell>
  )
}
