'use client'

import { useState } from 'react'
import { Search, Calendar, ChevronDown, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DashboardFilters } from '@/types'

interface DashboardHeaderProps {
  title?: string
  filters: DashboardFilters
  onFilterChange: (filters: Partial<DashboardFilters>) => void
  isLive?: boolean
  onToggleLive?: () => void
}

const periodFilters: { id: DashboardFilters['periodo']; label: string; hasIcon?: boolean }[] = [
  { id: 'hoje', label: 'Hoje' },
  { id: 'ontem', label: 'Ontem' },
  { id: 'semana', label: 'Semana' },
  { id: 'mes', label: 'Mês' },
  { id: 'trimestre', label: 'Trimestre' },
  { id: 'customizado', label: 'Período', hasIcon: true },
]

export function DashboardHeader({
  title = 'Painel da empresa',
  filters,
  onFilterChange,
}: DashboardHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <header className="border-b border-white/[0.06]">
      <div className="px-8 h-14 flex items-center gap-4">
        <h1 className="text-sm text-white/65"><span className="text-white">{title}</span></h1>

        <div className="relative ml-3 flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            type="text"
            placeholder="Buscar"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl bg-[#15171b] border border-white/[0.05] text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-cyan-400/45 focus:ring-2 focus:ring-cyan-400/15 transition-colors"
          />
        </div>

        <div className="ml-auto flex items-center gap-1">
          {periodFilters.slice(0, 4).map((filter) => (
            <button
              key={filter.id}
              onClick={() => onFilterChange({ periodo: filter.id })}
              className={cn(
                'h-8 px-3 rounded-lg text-[12px] font-medium transition-colors flex items-center gap-1.5',
                filters.periodo === filter.id
                  ? 'bg-cyan-400 text-slate-900 font-semibold'
                  : 'text-white/55 hover:text-white',
              )}
            >
              {filter.hasIcon && <Calendar className="h-3.5 w-3.5" />}
              {filter.label}
            </button>
          ))}
          <button
            onClick={() => onFilterChange({ responsavel: undefined })}
            className="h-8 px-3 rounded-lg text-[12px] text-white/55 hover:text-white transition-colors flex items-center gap-1.5 ml-1 border-l border-white/[0.06] pl-3"
          >
            <Users className="h-3.5 w-3.5" />
            Responsável
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>
      </div>
    </header>
  )
}
