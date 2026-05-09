// Mapeamento autoritativo entre as colunas das planilhas da Cloudia e os 3 sistemas:
//   1) cadastraai (front Next.js — lead-form, consulta-form, tratamento-form)
//   2) LeadAnalytics.Api (.NET — Lead, Contact, Payment, Unit, Attendant)
//   3) Doutor-Digital-Front (Vite — tabelas Finance, Contacts, Attendants)
//
// Cada empresa só vê suas próprias linhas — a isolação é feita server-side via tenant_id
// (claim no JWT). O front nunca decide "que empresa eu sou": pega o token e o backend filtra.

import type { KommoFieldTarget } from '@/lib/api'

export type CadastroFieldTarget =
  | KommoFieldTarget
  | 'observacao'
  | 'situacao'
  | 'clinica'
  | 'login'
  | 'dataOrigem'
  | 'dataModificacao'

// ---- Planilha 1: "Cadastro Geral" (leads) ----
// Colunas vindas da Cloudia → campo no lead-form do cadastraai → entidade .NET
export interface SpreadsheetField {
  column: string
  cadastroTarget: CadastroFieldTarget | null
  netEntity: 'Lead' | 'Contact' | 'Unit' | 'Attendant' | 'User' | 'Payment' | null
  netField: string | null
  notes?: string
}

export const CLOUDIA_LEADS: SpreadsheetField[] = [
  { column: 'ID',                          cadastroTarget: null,                    netEntity: 'Contact', netField: 'ExternalId',          notes: 'GUID curto da Cloudia. Vai para Lead.ExternalId / Contact.ImportBatchId.' },
  { column: 'Data',                        cadastroTarget: null,                    netEntity: 'Lead',    netField: 'CreatedAt',           notes: 'Data do cadastro (dia, sem hora).' },
  { column: 'Nome do Cliente',             cadastroTarget: 'nome',                  netEntity: 'Lead',    netField: 'Name' },
  { column: 'Telefone',                    cadastroTarget: 'telefone',              netEntity: 'Contact', netField: 'PhoneRaw',            notes: 'Normalizar p/ E.164 antes de gravar em Contact.PhoneNormalized.' },
  { column: 'Tipo',                        cadastroTarget: 'tipo',                  netEntity: 'Lead',    netField: 'Status',              notes: 'Cadastro | Resgate.' },
  { column: 'Origem Cadastro',             cadastroTarget: 'origem',                netEntity: 'Lead',    netField: 'Source',              notes: 'Lista fixa (ver CLOUDIA_ORIGENS abaixo).' },
  { column: 'Tipo de Resgate',             cadastroTarget: 'tipoResgate',           netEntity: 'Lead',    netField: 'Channel',             notes: 'Disparo em massa, Ligação 3C etc — só preenche se Tipo=Resgate.' },
  { column: 'Interação',                   cadastroTarget: 'interacao',             netEntity: 'Lead',    netField: 'ConversationState',   notes: 'Sim/Não → bool.' },
  { column: 'Cliente Agendou?',            cadastroTarget: 'agendouConsulta',       netEntity: 'Lead',    netField: 'HasAppointment',      notes: 'Sim/Não → bool.' },
  { column: 'Data do Agendamento',         cadastroTarget: 'dataAgendamento',       netEntity: 'Contact', netField: 'ConsultationAt' },
  { column: 'Motivo para Não Agendamento', cadastroTarget: 'motivoNaoAgendamento',  netEntity: 'Lead',    netField: 'Observations',        notes: 'Lista fixa (ver CLOUDIA_MOTIVOS_NAO_AGENDAMENTO abaixo).' },
  { column: 'Nome Responsável',            cadastroTarget: 'nomeResponsavel',       netEntity: 'Attendant', netField: 'Name' },
  { column: 'Login',                       cadastroTarget: 'login',                 netEntity: 'User',    netField: 'Email' },
  { column: 'Observação',                  cadastroTarget: 'observacao',            netEntity: 'Lead',    netField: 'Observations' },
  { column: 'Situação',                    cadastroTarget: 'situacao',              netEntity: 'Lead',    netField: 'AttendanceStatus',    notes: 'Compareceu | Faltou | Aguardando.' },
  { column: 'Clínica',                     cadastroTarget: 'clinica',               netEntity: 'Unit',    netField: 'Name' },
  { column: 'Ano',                         cadastroTarget: null,                    netEntity: null,      netField: null,                  notes: 'Derivado de CreatedAt. Não persistir.' },
  { column: 'Mês',                         cadastroTarget: null,                    netEntity: null,      netField: null,                  notes: 'Derivado de CreatedAt. Não persistir.' },
  { column: 'Data Origem',                 cadastroTarget: 'dataOrigem',            netEntity: 'Lead',    netField: 'CreatedAt' },
  { column: 'Data Modificação',            cadastroTarget: 'dataModificacao',       netEntity: 'Lead',    netField: 'LastUpdatedAt' },
]

// ---- Planilha 2: "Consultas Comparecidas" ----
export const CLOUDIA_CONSULTAS: SpreadsheetField[] = [
  { column: 'ID',                       cadastroTarget: null, netEntity: 'Lead',    netField: 'ExternalId' },
  { column: 'Data',                     cadastroTarget: null, netEntity: 'Lead',    netField: 'CreatedAt' },
  { column: 'Nome',                     cadastroTarget: 'nome',     netEntity: 'Lead', netField: 'Name' },
  { column: 'Telefone',                 cadastroTarget: 'telefone', netEntity: 'Contact', netField: 'PhoneRaw' },
  { column: 'Tipo',                     cadastroTarget: 'tipo',     netEntity: 'Lead', netField: 'Status' },
  { column: 'Origem',                   cadastroTarget: 'origem',   netEntity: 'Lead', netField: 'Source' },
  { column: 'Data do Agendamento',      cadastroTarget: 'dataAgendamento', netEntity: 'Contact', netField: 'ConsultationAt' },
  { column: 'Valor da Consulta',        cadastroTarget: null, netEntity: 'Payment', netField: 'Amount' },
  { column: 'Pagamento Antecipado',     cadastroTarget: 'pagamentoAntecipado', netEntity: 'Lead', netField: 'HasPayment' },
  { column: 'Valor 1° Recebimento',     cadastroTarget: null, netEntity: 'Payment', netField: 'Amount',          notes: 'Vira PaymentSplit #1.' },
  { column: 'Forma 1° Pagamento',       cadastroTarget: null, netEntity: 'Payment', netField: 'PaymentMethod' },
  { column: 'Data 1° Recebimento',      cadastroTarget: null, netEntity: 'Payment', netField: 'PaidAt' },
  { column: 'Valor 2° Recebimento',     cadastroTarget: null, netEntity: 'Payment', netField: 'Amount',          notes: 'Vira PaymentSplit #2.' },
  { column: 'Forma 2° Pagamento',       cadastroTarget: null, netEntity: 'Payment', netField: 'PaymentMethod' },
  { column: 'Data 2° Recebimento',      cadastroTarget: null, netEntity: 'Payment', netField: 'PaidAt' },
  { column: 'Total Recebido',           cadastroTarget: null, netEntity: null,      netField: null,              notes: 'Calculado (soma dos splits).' },
  { column: 'Falta Receber',            cadastroTarget: null, netEntity: null,      netField: null,              notes: 'Calculado (Valor da Consulta - Total Recebido).' },
  { column: 'Status',                   cadastroTarget: 'situacao', netEntity: 'Lead', netField: 'AttendanceStatus' },
  { column: 'Tratamento Indicado',      cadastroTarget: null, netEntity: 'Payment', netField: 'Treatment' },
  { column: 'Orçamento',                cadastroTarget: null, netEntity: 'Payment', netField: 'TreatmentValue' },
  { column: 'Fechou Tratamento?',       cadastroTarget: null, netEntity: 'Lead',    netField: 'ConvertedAt',     notes: 'Se Sim → set ConvertedAt = agora.' },
  { column: 'Motivo para não Fechamento', cadastroTarget: null, netEntity: 'Lead',  netField: 'Observations' },
  { column: 'Observação',               cadastroTarget: 'observacao', netEntity: 'Lead', netField: 'Observations' },
  { column: 'Nome Responsável',         cadastroTarget: 'nomeResponsavel', netEntity: 'Attendant', netField: 'Name' },
  { column: 'Login',                    cadastroTarget: 'login', netEntity: 'User', netField: 'Email' },
  { column: 'Situação',                 cadastroTarget: 'situacao', netEntity: 'Lead', netField: 'AttendanceStatus' },
  { column: 'Clínica',                  cadastroTarget: 'clinica', netEntity: 'Unit', netField: 'Name' },
  { column: 'Data Origem',              cadastroTarget: 'dataOrigem', netEntity: 'Lead', netField: 'CreatedAt' },
  { column: 'Data de Modificação',      cadastroTarget: 'dataModificacao', netEntity: 'Lead', netField: 'LastUpdatedAt' },
]

// ---- Planilha 3: "Tratamentos Realizados" ----
export const CLOUDIA_TRATAMENTOS: SpreadsheetField[] = [
  { column: 'ID',                  cadastroTarget: null, netEntity: 'Lead',    netField: 'ExternalId' },
  { column: 'Data',                cadastroTarget: null, netEntity: 'Payment', netField: 'CreatedAt' },
  { column: 'Nome',                cadastroTarget: 'nome',     netEntity: 'Lead', netField: 'Name' },
  { column: 'Telefone',            cadastroTarget: 'telefone', netEntity: 'Contact', netField: 'PhoneRaw' },
  { column: 'Tipo',                cadastroTarget: 'tipo',     netEntity: 'Lead', netField: 'Status' },
  { column: 'Origem',              cadastroTarget: 'origem',   netEntity: 'Lead', netField: 'Source' },
  { column: 'Valor',               cadastroTarget: null, netEntity: 'Payment', netField: 'TreatmentValue' },
  { column: 'Valor Recebimento',   cadastroTarget: null, netEntity: 'Payment', netField: 'Amount',         notes: 'Splits 1..4 viram PaymentSplit.' },
  { column: 'Forma de Pagamento',  cadastroTarget: null, netEntity: 'Payment', netField: 'PaymentMethod' },
  { column: 'Total Recebido',      cadastroTarget: null, netEntity: null,      netField: null,              notes: 'Calculado.' },
  { column: 'Falta Receber',       cadastroTarget: null, netEntity: null,      netField: null,              notes: 'Calculado.' },
  { column: 'Status',              cadastroTarget: 'situacao', netEntity: 'Lead', netField: 'AttendanceStatus' },
  { column: 'Descrição',           cadastroTarget: null, netEntity: 'Payment', netField: 'Notes' },
]

// ---- Lista canônica de origens (como está na Cloudia) ----
export const CLOUDIA_ORIGENS = [
  'Sem origem',
  'Campanha Meta (Instagram)',
  'Campanha Meta (Facebook)',
  'Campanha Google',
  'Ligação Google',
  'Fachada',
  'Panfleto',
  'Revista',
  'Indicação',
  'Site Oficial Doutor Hérnia',
  'Rádio',
  'TV',
  'Outdoor',
  'Eventos',
  'Direto Instagram',
  'Vendedor Externo',
  'Carro de Som',
  'Transferência de outra Unidade',
  'Blogueiros',
  'E-mail Marketing',
  'SMS',
  'WhatsApp',
  'Cheque Anjo',
  'Convênios/Parceiros',
  'Resgate: Disparo em massa',
  'Resgate: Disparo de agendamento',
  'Resgate: Ligação',
  'Resgate: Mensagem',
  'Resgate:Ligação 3C',
] as const

export type CloudiaOrigem = (typeof CLOUDIA_ORIGENS)[number]

// Origens que automaticamente classificam o lead como "Resgate"
export const CLOUDIA_RESGATE_ORIGENS: CloudiaOrigem[] = [
  'Resgate: Disparo em massa',
  'Resgate: Disparo de agendamento',
  'Resgate: Ligação',
  'Resgate: Mensagem',
  'Resgate:Ligação 3C',
]

// Mapa "Origem Cloudia" → "Tipo de Resgate" exibido no lead-form
export const CLOUDIA_RESGATE_TIPO: Record<string, string> = {
  'Resgate: Disparo em massa':      'Disparo em massa',
  'Resgate: Disparo de agendamento':'Disparo de agendamento',
  'Resgate: Ligação':               'Ligação',
  'Resgate: Mensagem':              'Mensagem',
  'Resgate:Ligação 3C':             'Ligação 3C',
}

// ---- Motivos para não agendamento (lista fixa da Cloudia) ----
export const CLOUDIA_MOTIVOS_NAO_AGENDAMENTO = [
  'Não deu continuidade ao atendimento',
  'Clicou por engano',
  'Sem condições financeiras',
  'Distância da clínica',
  'Já agendou em outra clínica',
  'Não é o tratamento que precisa',
  'Apenas pesquisa de preço',
  'Indeciso',
  'Não atende telefone',
  'Telefone inválido',
  'Bloqueou contato',
  'Pediu para não ligar mais',
  'Vai pensar e retorna',
  'Aguardando familiar',
  'Sem interesse no momento',
  'Outro',
] as const

// ---- Formas de pagamento (vão para Payment.PaymentMethod) ----
export const CLOUDIA_FORMAS_PAGAMENTO = ['pix', 'dinheiro', 'debito', 'credito', 'boleto'] as const

// ---- Helper: dado um valor literal da Cloudia, retorna o que preencher no lead-form ----
export function cloudiaToLeadForm(row: Record<string, string>) {
  const origem = (row['Origem Cadastro'] ?? row['Origem'] ?? '').trim()
  const tipoRaw = (row['Tipo'] ?? '').trim()
  const isResgate = tipoRaw.toLowerCase() === 'resgate' || CLOUDIA_RESGATE_ORIGENS.includes(origem as CloudiaOrigem)
  return {
    nome: (row['Nome do Cliente'] ?? row['Nome'] ?? '').trim(),
    telefone: (row['Telefone'] ?? '').trim(),
    origem: origem || 'Sem origem',
    tipo: isResgate ? 'Resgate' : 'Cadastro',
    tipoResgate: isResgate ? CLOUDIA_RESGATE_TIPO[origem] ?? undefined : undefined,
    interacao: yn(row['Interação']),
    agendouConsulta: yn(row['Cliente Agendou?']),
    dataAgendamento: parseBrDate(row['Data do Agendamento']),
    motivoNaoAgendamento: yn(row['Cliente Agendou?']) ? undefined : (row['Motivo para Não Agendamento'] || undefined),
    pagamentoAntecipado: yn(row['Pagamento Antecipado']),
    nomeResponsavel: (row['Nome Responsável'] ?? '').trim(),
  }
}

function yn(v: string | undefined): boolean {
  if (!v) return false
  const s = v.trim().toLowerCase()
  return s === 'sim' || s === 'yes' || s === 'true' || s === '1'
}

function parseBrDate(v: string | undefined): string | undefined {
  if (!v) return undefined
  // "04/05/2026" ou "04/05/2026 15:50:50"
  const m = v.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/)
  if (!m) return undefined
  const [, d, mo, y, h = '00', mi = '00', s = '00'] = m
  const iso = `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}T${h.padStart(2, '0')}:${mi}:${s}`
  return iso
}
