'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { UserPlus, CheckCircle2, AlertCircle, Pencil } from 'lucide-react'
import { CadastroFormShell } from './form-shell'
import { TextInput, SelectInput, TextareaInput, Segmented, ToggleSwitch } from './form-fields'
import { addLead, updateLead } from '@/lib/cadastro-store'
import { useConfig } from '@/lib/config-store'
import type { Lead, LeadFormData } from '@/types'

interface LeadFormProps {
  onBack: () => void
  onSaved?: (lead: Lead) => void
  editing?: Lead
}

const initialState: LeadFormData = {
  nome: '',
  telefone: '',
  origem: '',
  tipo: 'Cadastro',
  tipoResgate: undefined,
  interacao: false,
  agendouConsulta: false,
  pagamentoAntecipado: false,
  dataAgendamento: '',
  motivoNaoAgendamento: '',
  nomeResponsavel: '',
}

function fromLead(lead: Lead): LeadFormData {
  return {
    nome: lead.nome,
    telefone: lead.telefone,
    origem: lead.origem,
    tipo: lead.tipo,
    tipoResgate: lead.tipoResgate,
    interacao: lead.interacao,
    agendouConsulta: lead.agendouConsulta,
    pagamentoAntecipado: lead.pagamentoAntecipado,
    dataAgendamento: lead.dataAgendamento ?? '',
    motivoNaoAgendamento: lead.motivoNaoAgendamento ?? '',
    nomeResponsavel: lead.nomeResponsavel,
  }
}

export function LeadForm({ onBack, onSaved, editing }: LeadFormProps) {
  const config = useConfig()
  const [data, setData] = useState<LeadFormData>(() =>
    editing ? fromLead(editing) : { ...initialState, nomeResponsavel: '' },
  )
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; msg: string } | null>(null)

  useEffect(() => {
    if (editing) setData(fromLead(editing))
  }, [editing])

  const set = <K extends keyof LeadFormData>(key: K, value: LeadFormData[K]) =>
    setData((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFeedback(null)
    try {
      if (data.tipo === 'Resgate' && !data.tipoResgate) {
        setFeedback({ kind: 'error', msg: 'Selecione o tipo de resgate.' })
        return
      }
      if (data.agendouConsulta && !data.dataAgendamento) {
        setFeedback({ kind: 'error', msg: 'Informe a data do agendamento.' })
        return
      }
      if (!data.agendouConsulta && !data.motivoNaoAgendamento?.trim()) {
        setFeedback({ kind: 'error', msg: 'Informe o motivo de não ter agendado.' })
        return
      }
      if (!data.nomeResponsavel) {
        setFeedback({ kind: 'error', msg: 'Selecione o responsável.' })
        return
      }
      const lead = editing ? updateLead(editing.id, data) : addLead(data)
      if (!lead) {
        setFeedback({ kind: 'error', msg: 'Não foi possível salvar o lead.' })
        return
      }
      setFeedback({
        kind: 'success',
        msg: editing
          ? `Lead "${lead.nome}" atualizado com sucesso.`
          : `Lead "${lead.nome}" cadastrado com sucesso.`,
      })
      if (!editing) setData({ ...initialState, nomeResponsavel: '' })
      onSaved?.(lead)
    } catch (err) {
      setFeedback({ kind: 'error', msg: err instanceof Error ? err.message : 'Erro inesperado.' })
    }
  }

  const title = editing ? 'Editar Lead' : 'Cadastrar Lead'
  const description = editing
    ? `Atualize as informações de ${editing.nome}.`
    : 'Cadastro Geral — registre um novo lead e o status do primeiro contato.'
  const Icon = editing ? Pencil : UserPlus

  return (
    <CadastroFormShell title={title} description={description} icon={Icon} onBack={onBack}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput
            label="Nome"
            placeholder="Nome completo do lead"
            value={data.nome}
            onChange={(e) => set('nome', e.target.value)}
            required
          />
          <TextInput
            label="Telefone"
            placeholder="(00) 00000-0000"
            value={data.telefone}
            onChange={(e) => set('telefone', e.target.value)}
            required
          />
          <SelectInput
            label="Origem"
            value={data.origem}
            onChange={(e) => set('origem', e.target.value)}
            options={config.origens.map((o) => ({ value: o, label: o }))}
            placeholder="Selecione…"
            required
            hint="Gerencie a lista em Configurações."
          />
          <SelectInput
            label="Responsável"
            value={data.nomeResponsavel}
            onChange={(e) => set('nomeResponsavel', e.target.value)}
            options={config.responsaveis.map((r) => ({ value: r, label: r }))}
            placeholder="Selecione…"
            required
            hint="Gerencie a equipe em Configurações."
          />
        </div>

        <Segmented<LeadFormData['tipo']>
          label="Tipo de cadastro"
          value={data.tipo}
          onChange={(v) =>
            setData((prev) => ({
              ...prev,
              tipo: v,
              tipoResgate: v === 'Resgate' ? prev.tipoResgate ?? config.tiposResgate[0] : undefined,
            }))
          }
          options={[
            { value: 'Cadastro', label: 'Cadastro', description: 'Lead novo' },
            { value: 'Resgate', label: 'Resgate', description: 'Lead recuperado' },
          ]}
          required
        />

        {data.tipo === 'Resgate' && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
            <SelectInput
              label="Tipo de resgate"
              value={data.tipoResgate ?? ''}
              onChange={(e) => set('tipoResgate', e.target.value)}
              options={config.tiposResgate.map((t) => ({ value: t, label: t }))}
              placeholder="Selecione…"
              required
            />
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <ToggleSwitch
            label="Houve interação?"
            description="O lead respondeu/interagiu"
            checked={data.interacao}
            onChange={(v) => set('interacao', v)}
          />
          <ToggleSwitch
            label="Agendou consulta?"
            description="Consulta marcada"
            checked={data.agendouConsulta}
            onChange={(v) => set('agendouConsulta', v)}
          />
          <ToggleSwitch
            label="Pagamento antecipado?"
            description="Já pagou pela consulta"
            checked={data.pagamentoAntecipado}
            onChange={(v) => set('pagamentoAntecipado', v)}
          />
        </div>

        {data.agendouConsulta ? (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
            <TextInput
              label="Data do agendamento"
              type="datetime-local"
              value={data.dataAgendamento ?? ''}
              onChange={(e) => set('dataAgendamento', e.target.value)}
              required
            />
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
            <TextareaInput
              label="Motivo do não agendamento"
              placeholder="Descreva o motivo…"
              value={data.motivoNaoAgendamento ?? ''}
              onChange={(e) => set('motivoNaoAgendamento', e.target.value)}
              required
            />
          </motion.div>
        )}

        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className={
              feedback.kind === 'success'
                ? 'flex items-start gap-2 p-3 rounded-2xl border border-cyan-400/30 bg-cyan-500/[0.08] text-cyan-200 text-sm'
                : 'flex items-start gap-2 p-3 rounded-2xl border border-rose-400/30 bg-rose-500/10 text-rose-200 text-sm'
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

        <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-white/[0.05]">
          <button
            type="button"
            onClick={() => {
              setData(editing ? fromLead(editing) : { ...initialState, nomeResponsavel: '' })
              setFeedback(null)
            }}
            className="px-4 h-11 rounded-2xl border border-white/[0.05] bg-[#0c0d10] text-sm text-white/65 hover:text-white hover:border-white/[0.12] transition-colors"
          >
            {editing ? 'Restaurar' : 'Limpar'}
          </button>
          <button
            type="submit"
            className="px-5 h-11 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-900 font-semibold text-sm transition-colors"
          >
            {editing ? 'Salvar alterações' : 'Cadastrar Lead'}
          </button>
        </div>
      </form>
    </CadastroFormShell>
  )
}
