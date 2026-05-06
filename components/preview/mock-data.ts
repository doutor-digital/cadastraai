export interface PreviewKpi {
  label: string
  value: string
  delta?: { value: string; type: 'positive' | 'negative' | 'neutral' }
  hint?: string
}

export interface PreviewOrigin {
  nome: string
  count: number
  pct: number
}

export const previewMock = {
  empresa: 'Instituto Trauma',
  totalLeads: 247,
  agendamentos: 178,
  naoAgendados: 69,
  consultas: 152,
  tratamentos: 84,
  receita: 124320,
  ticketMedio: 1480,
  taxaConversao: 34,
  origens: [
    { nome: 'Instagram', count: 142, pct: 57 },
    { nome: 'Indicação', count: 68, pct: 28 },
    { nome: 'Site', count: 22, pct: 9 },
    { nome: 'Outros', count: 15, pct: 6 },
  ] as PreviewOrigin[],
  sparkline: [22, 28, 24, 30, 36, 32, 41, 38, 45, 52, 48, 56] as number[],
  responsaveis: [
    { nome: 'Rayssa', leads: 96, fechados: 38 },
    { nome: 'Maria Eduarda', leads: 84, fechados: 31 },
    { nome: 'Adriele', leads: 67, fechados: 15 },
  ],
  formas: [
    { forma: 'Pix', valor: 58200, pct: 47 },
    { forma: 'Cartão', valor: 39200, pct: 32 },
    { forma: 'Boleto', valor: 16400, pct: 13 },
    { forma: 'Dinheiro', valor: 10520, pct: 8 },
  ],
  members: [
    { nome: 'João Pereira', email: 'joao@institutotrauma.com', role: 'Owner', avatar: '' },
    { nome: 'Rayssa Lima', email: 'rayssa@institutotrauma.com', role: 'Admin', avatar: '' },
    { nome: 'Maria Eduarda', email: 'maria@institutotrauma.com', role: 'Member', avatar: '' },
    { nome: 'Adriele Sousa', email: 'adriele@institutotrauma.com', role: 'Member', avatar: '' },
  ],
  invites: [
    { email: 'secretaria@institutotrauma.com', role: 'Member', status: 'Pending', expires: '13/05/2026' },
    { email: 'financeiro@institutotrauma.com', role: 'Admin', status: 'Pending', expires: '14/05/2026' },
  ],
}

export type PreviewSection = 'login' | 'dashboard' | 'lead' | 'empresa'

export const sections: { id: PreviewSection; label: string }[] = [
  { id: 'login', label: 'Login' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'lead', label: 'Cadastrar Lead' },
  { id: 'empresa', label: 'Empresa & Equipe' },
]

export function brl(n: number): string {
  return n.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}
