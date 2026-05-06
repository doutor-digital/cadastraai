'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { DashboardSidebar, type DashboardView } from '@/components/dashboard/sidebar'
import { DashboardView as DashboardHomeView } from '@/components/dashboard/dashboard-view'
import { LeadForm } from '@/components/cadastro/lead-form'
import { LeadsListView } from '@/components/cadastro/leads-list-view'
import { LeadDetailView } from '@/components/cadastro/lead-detail-view'
import { ConsultaForm } from '@/components/cadastro/consulta-form'
import { TratamentoForm } from '@/components/cadastro/tratamento-form'
import { RecebimentosList } from '@/components/cadastro/recebimentos-list'
import { EmpresaView } from '@/components/empresa/empresa-view'
import { ImportView } from '@/components/cadastro/import-view'
import { ImportadosView } from '@/components/cadastro/importados-view'
import { RelatoriosView } from '@/components/cadastro/relatorios-view'
import { ConfigView } from '@/components/cadastro/config-view'
import { useCadastroStore } from '@/lib/cadastro-store'
import type { Consulta, Lead, Tratamento } from '@/types'

const validViews: DashboardView[] = [
  'dashboard',
  'leads-list',
  'lead-detail',
  'lead',
  'consulta',
  'tratamento',
  'recebimentos',
  'empresa',
  'importar',
  'importados',
  'relatorios',
  'config',
]

function isValidView(value: string | null): value is DashboardView {
  return value !== null && (validViews as string[]).includes(value)
}

export function DashboardContent() {
  const params = useSearchParams()
  const initial = params.get('view')
  const [view, setView] = useState<DashboardView>(isValidView(initial) ? initial : 'dashboard')
  const [chainedLeadId, setChainedLeadId] = useState<string | null>(null)
  const [chainedConsultaId, setChainedConsultaId] = useState<string | null>(null)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [editingConsulta, setEditingConsulta] = useState<Consulta | null>(null)
  const [editingTratamento, setEditingTratamento] = useState<Tratamento | null>(null)
  const [detailLeadId, setDetailLeadId] = useState<string | null>(null)
  const store = useCadastroStore()

  useEffect(() => {
    const next = params.get('view')
    if (isValidView(next) && next !== view) setView(next)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])

  const goDashboard = () => {
    setChainedLeadId(null)
    setChainedConsultaId(null)
    setEditingLead(null)
    setEditingConsulta(null)
    setEditingTratamento(null)
    setDetailLeadId(null)
    setView('dashboard')
  }

  const handleNavigate = (v: DashboardView) => {
    setChainedLeadId(null)
    setChainedConsultaId(null)
    if (v !== 'lead') setEditingLead(null)
    if (v !== 'consulta') setEditingConsulta(null)
    if (v !== 'tratamento') setEditingTratamento(null)
    if (v !== 'lead-detail') setDetailLeadId(null)
    setView(v)
  }

  const handleEditConsulta = (consulta: Consulta) => {
    setEditingConsulta(consulta)
    setView('consulta')
  }

  const handleEditTratamento = (tratamento: Tratamento) => {
    setEditingTratamento(tratamento)
    setView('tratamento')
  }

  const handleOpenLead = (lead: Lead) => {
    setDetailLeadId(lead.id)
    setView('lead-detail')
  }

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead)
    setView('lead')
  }

  const handleNewLead = () => {
    setEditingLead(null)
    setView('lead')
  }

  return (
    <div className="min-h-screen flex bg-[#0c0d10] text-white">
      <DashboardSidebar active={view} onChange={handleNavigate} />

      <div className="flex-1 min-w-0 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${view}-${editingLead?.id ?? detailLeadId ?? 'new'}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {view === 'dashboard' && <DashboardHomeView />}
            {view === 'leads-list' && (
              <LeadsListView
                onBack={goDashboard}
                onEdit={handleEditLead}
                onCreateNew={handleNewLead}
                onOpen={handleOpenLead}
              />
            )}
            {view === 'lead-detail' && detailLeadId && (
              <LeadDetailView
                leadId={detailLeadId}
                onBack={() => {
                  setDetailLeadId(null)
                  setView('leads-list')
                }}
                onEdit={handleEditLead}
                onEditConsulta={handleEditConsulta}
                onEditTratamento={handleEditTratamento}
                onDeleted={() => {
                  setDetailLeadId(null)
                  setView('leads-list')
                }}
              />
            )}
            {view === 'lead' && (
              <LeadForm
                onBack={() => {
                  setEditingLead(null)
                  setView('leads-list')
                }}
                editing={editingLead ?? undefined}
                onSaved={(lead) => {
                  if (editingLead) {
                    setEditingLead(null)
                    setDetailLeadId(lead.id)
                    setView('lead-detail')
                  } else if (lead.agendouConsulta) {
                    setChainedLeadId(lead.id)
                    setView('consulta')
                  } else {
                    setView('leads-list')
                  }
                }}
              />
            )}
            {view === 'consulta' && (
              <ConsultaForm
                onBack={() => {
                  if (editingConsulta) {
                    const lead = store.leads.find((l) => l.id === editingConsulta.leadId)
                    setEditingConsulta(null)
                    if (lead) {
                      setDetailLeadId(lead.id)
                      setView('lead-detail')
                      return
                    }
                  }
                  goDashboard()
                }}
                prefilledLeadId={chainedLeadId ?? undefined}
                editing={editingConsulta ?? undefined}
                onSaved={(consulta) => {
                  setChainedLeadId(null)
                  if (editingConsulta) {
                    setEditingConsulta(null)
                    setDetailLeadId(consulta.leadId)
                    setView('lead-detail')
                  } else {
                    setChainedConsultaId(consulta.id)
                    setView('tratamento')
                  }
                }}
              />
            )}
            {view === 'tratamento' && (
              <TratamentoForm
                onBack={() => {
                  if (editingTratamento) {
                    const consulta = store.consultas.find(
                      (c) => c.id === editingTratamento.consultaId,
                    )
                    setEditingTratamento(null)
                    if (consulta) {
                      setDetailLeadId(consulta.leadId)
                      setView('lead-detail')
                      return
                    }
                  }
                  goDashboard()
                }}
                prefilledConsultaId={chainedConsultaId ?? undefined}
                editing={editingTratamento ?? undefined}
                onSaved={(tratamento) => {
                  setChainedConsultaId(null)
                  setEditingTratamento(null)
                  const consulta = store.consultas.find((c) => c.id === tratamento.consultaId)
                  if (consulta) {
                    setDetailLeadId(consulta.leadId)
                    setView('lead-detail')
                  } else {
                    setView('dashboard')
                  }
                }}
              />
            )}
            {view === 'recebimentos' && (
              <RecebimentosList
                onBack={goDashboard}
                onViewLead={(leadId) => {
                  setDetailLeadId(leadId)
                  setView('lead-detail')
                }}
                onEditConsulta={handleEditConsulta}
                onEditTratamento={handleEditTratamento}
              />
            )}
            {view === 'empresa' && <EmpresaView onBack={goDashboard} />}
            {view === 'importar' && <ImportView onBack={goDashboard} />}
            {view === 'importados' && <ImportadosView onBack={goDashboard} />}
            {view === 'relatorios' && <RelatoriosView onBack={goDashboard} />}
            {view === 'config' && <ConfigView onBack={goDashboard} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
