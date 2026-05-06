// Types para integração com backend C# - Sistema CRM Trauma
export interface User {
  id: string
  email: string
  name: string
  avatarUrl?: string
  role: 'admin' | 'user' | 'operator'
  createdAt: string
  lastLoginAt?: string
}

export interface AuthResponse {
  success: boolean
  user?: User
  token?: string
  refreshToken?: string
  expiresIn?: number
  error?: string
}

export interface GoogleAuthPayload {
  idToken: string
  accessToken?: string
}

// Prisma Schema Types - Lead (Cadastro Geral)
export interface Lead {
  id: string
  empresaId?: string
  nome: string
  telefone: string
  origem: string
  tipo: 'Cadastro' | 'Resgate'
  tipoResgate?: string
  interacao: boolean
  agendouConsulta: boolean
  pagamentoAntecipado: boolean
  dataAgendamento?: string
  motivoNaoAgendamento?: string
  nomeResponsavel: string
  createdAt: string
  consulta?: Consulta
}

// Prisma Schema Types - Consulta (Consulta Comparecida)
export interface Consulta {
  id: string
  leadId: string
  lead?: Lead
  valorConsulta: number
  pagamentoAntecipado: boolean
  recebimentos: Recebimento[]
  tratamentoIndicado: string
  orcamento: number
  compareceu: boolean
  fechouTratamento: boolean
  motivoNaoFechamento?: string
  createdAt: string
  tratamento?: Tratamento
}

// Cor do semáforo de motivos de não fechamento.
export type CorSemaforo = 'verde' | 'amarelo' | 'vermelho'

export interface MotivoNaoFechamento {
  id: string
  empresaId: string
  nome: string
  cor: CorSemaforo
  isDefault: boolean
  createdAt: string
}

// Lista padrão usada no fluxo local (offline / demo) — espelha o seed do backend.
export const MOTIVOS_NAO_FECHAMENTO_DEFAULT: { nome: string; cor: CorSemaforo }[] = [
  { nome: 'Fechou tratamento total', cor: 'verde' },
  { nome: 'Fechou tratamento parcial', cor: 'verde' },
  { nome: 'Assinou contrato, sem entrada', cor: 'amarelo' },
  { nome: 'Vai decidir com familiares', cor: 'amarelo' },
  { nome: 'Vai verificar a melhor forma de pagamento', cor: 'amarelo' },
  { nome: 'Solicitado exame de imagem', cor: 'amarelo' },
  { nome: 'Mora fora +50km', cor: 'vermelho' },
  { nome: 'Outra patologia', cor: 'vermelho' },
  { nome: 'Sem condições financeiras', cor: 'vermelho' },
]

// Prisma Schema Types - Tratamento (Tratamentos Fechados)
export interface Tratamento {
  id: string
  consultaId: string
  consulta?: Consulta
  planoTratamento: string
  planoPilates?: string
  musculacao?: string
  procedimento?: string
  valorPlano: number
  recebimentos: Recebimento[]
  createdAt: string
}

// Prisma Schema Types - Recebimento
export interface Recebimento {
  id: string
  valorRecebimento: number
  formaPagamento: string
  dataRecebimento: string
  consultaId?: string
  consulta?: Consulta
  tratamentoId?: string
  tratamento?: Tratamento
}

// Dashboard KPIs
export interface DashboardKPIs {
  totalLeads: {
    value: number
    delta: number
    deltaPercent: number
    sparkline: number[]
  }
  taxaAgendamento: {
    value: number
    delta: number
    deltaPercent: number
    sparkline: number[]
  }
  taxaFechamento: {
    value: number
    delta: number
    deltaPercent: number
    sparkline: number[]
  }
  receitaTotal: {
    value: number
    delta: number
    deltaPercent: number
    sparkline: number[]
  }
  ticketMedio: {
    value: number
    delta: number
    deltaPercent: number
    sparkline: number[]
  }
}

// Funil de Conversão
export interface FunnelData {
  etapa: string
  valor: number
  percentual: number
  conversaoAnterior?: number
}

// Receita por período
export interface ReceitaData {
  data: string
  consultas: number
  tratamentos: number
  total: number
}

// Performance por Responsável
export interface ResponsavelData {
  nome: string
  leads: number
  agendamentos: number
  fechamentos: number
}

// Distribuição de Planos
export interface PlanoData {
  nome: string
  quantidade: number
  percentual: number
  cor: string
}

// Dashboard Stats (para a tela original)
export interface DashboardStats {
  mensagensRecebidas: {
    total: number
    ontem: number
    sources: {
      name: string
      count: number
      color: 'green' | 'blue' | 'gray'
    }[]
  }
  conversasAtuais: {
    total: number
    variacao: number
    ontem: string
  }
  chatsSemRespostas: {
    total: number
    variacao: number
    ontem: string
  }
  tempoResposta: {
    valor: string
    ontem: string
  }
  maisTempoEsperando: {
    valor: string
  }
  leadsGanhos: {
    total: number
    valor: number
    variacao: number
    ontem: string
  }
  leadsAtivos: {
    total: number
    valor: number
    variacao: number
    ontem: string
  }
  tarefas: {
    total: number
  }
  fontesLead: {
    nome: string
    percentual: number
  }[]
}

// Filtros do Dashboard
export interface DashboardFilters {
  periodo: 'hoje' | 'ontem' | 'semana' | 'mes' | 'trimestre' | 'customizado'
  dataInicio?: string
  dataFim?: string
  responsavel?: string[]
  origem?: string
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Form states
export interface LeadFormData {
  nome: string
  telefone: string
  origem: string
  tipo: 'Cadastro' | 'Resgate'
  tipoResgate?: string
  interacao: boolean
  agendouConsulta: boolean
  pagamentoAntecipado: boolean
  dataAgendamento?: string
  motivoNaoAgendamento?: string
  nomeResponsavel: string
}

export interface ConsultaFormData {
  leadId: string
  valorConsulta: number
  pagamentoAntecipado: boolean
  recebimentos: {
    valorRecebimento: number
    formaPagamento: string
    dataRecebimento: string
  }[]
  tratamentoIndicado: string
  orcamento: number
  compareceu: boolean
  fechouTratamento: boolean
  motivoNaoFechamento?: string
}

export interface TratamentoFormData {
  consultaId: string
  planoTratamento: string
  planoPilates?: string
  musculacao?: string
  procedimento?: string
  valorPlano: number
  recebimentos: {
    valorRecebimento: number
    formaPagamento: string
    dataRecebimento: string
  }[]
}
