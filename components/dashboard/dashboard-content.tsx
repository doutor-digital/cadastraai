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
import { ConfigView } from '@/components/cadastro/config-view'
import type { Lead } from '@/types'

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
  const [detailLeadId, setDetailLeadId] = useState<string | null>(null)

  useEffect(() => {
    const next = params.get('view')
    if (isValidView(next) && next !== view) setView(next)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])

  const goDashboard = () => {
    setChainedLeadId(null)
    setChainedConsultaId(null)
    setEditingLead(null)
    setDetailLeadId(null)
    setView('dashboard')
  }

  const handleNavigate = (v: DashboardView) => {
    setChainedLeadId(null)
    setChainedConsultaId(null)
    if (v !== 'lead') setEditingLead(null)
    if (v !== 'lead-detail') setDetailLeadId(null)
    setView(v)
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
                onBack={goDashboard}
                prefilledLeadId={chainedLeadId ?? undefined}
                onSaved={(consulta) => {
                  setChainedLeadId(null)
                  if (consulta.fechouTratamento) {
                    setChainedConsultaId(consulta.id)
                    setView('tratamento')
                  }
                }}
              />
            )}
            {view === 'tratamento' && (
              <TratamentoForm
                onBack={goDashboard}
                prefilledConsultaId={chainedConsultaId ?? undefined}
                onSaved={() => setChainedConsultaId(null)}
              />
            )}
            {view === 'recebimentos' && <RecebimentosList onBack={goDashboard} />}
            {view === 'empresa' && <EmpresaView onBack={goDashboard} />}
            {view === 'importar' && <ImportView onBack={goDashboard} />}
            {view === 'config' && <ConfigView onBack={goDashboard} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
