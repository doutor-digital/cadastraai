'use client'

import { previewMock as m, brl, type PreviewSection } from './mock-data'

const navItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'lead', label: 'Cadastrar Lead' },
  { id: 'consulta', label: 'Cadastrar Consulta' },
  { id: 'tratamento', label: 'Tratamentos' },
  { id: 'recebimentos', label: 'Recebimentos' },
  { id: 'empresa', label: 'Empresa & Equipe' },
]

const bgClass = 'min-h-screen text-slate-100 font-sans'
const bgStyle = { background: 'linear-gradient(180deg, #0a0a16 0%, #11122a 60%, #181a3a 100%)' }

function Sidebar({ active }: { active: string }) {
  return (
    <aside className="w-[244px] shrink-0 h-screen sticky top-0 border-r border-white/5 px-3 py-5">
      <div className="flex items-center gap-2 px-2 mb-7">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-400 to-violet-500" />
        <span className="text-sm font-semibold tracking-tight">cadastra.ai</span>
      </div>
      <nav className="space-y-0.5">
        {navItems.map((n) => (
          <a
            key={n.id}
            className={`block px-3 h-9 rounded-md text-[13px] flex items-center transition-colors ${
              active === n.id ? 'bg-white/[0.06] text-white' : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            {n.label}
          </a>
        ))}
      </nav>
    </aside>
  )
}

function Spark({ data, color }: { data: number[]; color: string }) {
  const w = 120, h = 40
  const max = Math.max(...data), min = Math.min(...data), r = max - min || 1
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / r) * (h - 4) - 2}`).join(' ')
  const id = `sg-${color.replace('#', '')}`
  return (
    <svg width={w} height={h} className="overflow-visible">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline fill={`url(#${id})`} stroke="none" points={`0,${h} ${pts} ${w},${h}`} />
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" points={pts} />
    </svg>
  )
}

export function StripeLogin() {
  return (
    <div className={`${bgClass} grid grid-cols-2`} style={bgStyle}>
      <div className="p-12 flex flex-col justify-between border-r border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500" />
          <span className="text-base font-semibold tracking-tight">cadastra.ai</span>
        </div>
        <div className="space-y-6">
          <p className="text-[12px] uppercase tracking-[0.18em] text-violet-300/80">Para clínicas que crescem</p>
          <h1 className="text-[44px] font-semibold leading-[1.05] tracking-tight">
            Acompanhe seus<br />
            leads e receita<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-violet-400">em tempo real.</span>
          </h1>
          <ul className="space-y-2.5 text-[14px] text-slate-300">
            <li className="flex items-center gap-2.5"><span className="h-1.5 w-1.5 rounded-full bg-violet-400" />Dashboard ao vivo com KPIs do seu schema</li>
            <li className="flex items-center gap-2.5"><span className="h-1.5 w-1.5 rounded-full bg-violet-400" />Convide a equipe por e-mail (login auto)</li>
            <li className="flex items-center gap-2.5"><span className="h-1.5 w-1.5 rounded-full bg-violet-400" />Importação de planilha em massa</li>
          </ul>
        </div>
        <div className="text-[12px] text-slate-500">© 2026 cadastra.ai</div>
      </div>
      <div className="flex items-center justify-center p-12">
        <div className="w-full max-w-sm">
          <h2 className="text-[24px] font-semibold mb-1.5 tracking-tight">Bem-vindo de volta</h2>
          <p className="text-[14px] text-slate-400 mb-7">Acesse seu painel.</p>
          <button className="w-full h-11 rounded-lg border border-white/10 bg-white/[0.03] text-[14px] hover:bg-white/[0.06] transition-colors mb-3">
            Continuar com Google
          </button>
          <div className="flex items-center my-5">
            <div className="flex-1 h-px bg-white/10" />
            <span className="px-3 text-[11px] text-slate-500 uppercase tracking-wider">ou</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>
          <input placeholder="seu@email.com" className="w-full h-11 px-3.5 mb-3 rounded-lg bg-white/[0.03] border border-white/10 text-[14px] placeholder:text-slate-500 focus:outline-none focus:border-violet-400/60 focus:ring-2 focus:ring-violet-400/20" />
          <input type="password" placeholder="Senha" className="w-full h-11 px-3.5 mb-5 rounded-lg bg-white/[0.03] border border-white/10 text-[14px] placeholder:text-slate-500 focus:outline-none focus:border-violet-400/60 focus:ring-2 focus:ring-violet-400/20" />
          <button className="w-full h-11 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 text-[14px] font-semibold text-white">Entrar</button>
          <p className="text-[13px] text-center text-slate-400 mt-5">Não tem conta? <a className="text-violet-300 hover:text-violet-200">Criar conta</a></p>
        </div>
      </div>
    </div>
  )
}

export function StripeDashboard() {
  return (
    <div className={`${bgClass} flex`} style={bgStyle}>
      <Sidebar active="dashboard" />
      <div className="flex-1 min-w-0">
        <header className="border-b border-white/5 h-16 flex items-center px-8 gap-6">
          <p className="text-sm text-slate-300"><span className="text-slate-500">Painel</span> · {m.empresa}</p>
          <div className="ml-auto inline-flex items-center rounded-md border border-white/10 p-0.5">
            {['Hoje', 'Semana', 'Mês'].map((p, i) => (
              <button key={p} className={`h-7 px-3 rounded text-[12px] ${i === 1 ? 'bg-white/10 text-white font-medium' : 'text-slate-400'}`}>{p}</button>
            ))}
          </div>
        </header>
        <main className="px-8 py-10 max-w-[1200px]">
          <h1 className="text-[28px] font-semibold tracking-tight mb-8">Indicadores</h1>
          <div className="grid grid-cols-4 gap-4 mb-4">
            {[
              { label: 'Leads', value: m.totalLeads, delta: '+12.3%', color: '#a78bfa' },
              { label: 'Consultas', value: m.consultas, delta: '+8.1%', color: '#818cf8' },
              { label: 'Tratamentos', value: m.tratamentos, delta: '+22.4%', color: '#22d3ee' },
              { label: 'Receita', value: brl(m.receita), delta: '+18.2%', color: '#34d399' },
            ].map((k) => (
              <div key={k.label} className="rounded-2xl p-5 border border-white/[0.07] bg-white/[0.02] hover:border-white/15 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">{k.label}</span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold tabular-nums" style={{ background: `${k.color}1a`, color: k.color }}>{k.delta}</span>
                </div>
                <p className="text-[34px] font-semibold tabular-nums leading-none mb-3">{k.value}</p>
                <Spark data={m.sparkline} color={k.color} />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 rounded-2xl p-6 border border-white/[0.07] bg-white/[0.02]">
              <h3 className="text-[14px] font-semibold mb-5">Performance por responsável</h3>
              <ul className="space-y-4">
                {m.responsaveis.map((r) => (
                  <li key={r.nome}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[13px] text-slate-200">{r.nome}</span>
                      <span className="text-[12px] text-slate-400 tabular-nums">{r.fechados}/{r.leads}</span>
                    </div>
                    <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(r.fechados / r.leads) * 100}%`, background: 'linear-gradient(90deg, #818cf8, #c084fc)' }} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl p-6 border border-white/[0.07] bg-white/[0.02]">
              <h3 className="text-[14px] font-semibold mb-1">Receita por forma</h3>
              <p className="text-[12px] text-slate-400 mb-5">{brl(m.receita)} no total</p>
              <ul className="space-y-3">
                {m.formas.map((f, i) => {
                  const colors = ['#a78bfa', '#34d399', '#fbbf24', '#fb7185']
                  return (
                    <li key={f.forma} className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full" style={{ background: colors[i] }} />
                      <span className="flex-1 text-[13px] text-slate-200">{f.forma}</span>
                      <span className="text-[13px] tabular-nums text-slate-400">{f.pct}%</span>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export function StripeLead() {
  return (
    <div className={`${bgClass} flex`} style={bgStyle}>
      <Sidebar active="lead" />
      <div className="flex-1 min-w-0">
        <header className="border-b border-white/5 h-16 flex items-center px-8 gap-6">
          <p className="text-sm text-slate-300"><span className="text-slate-500">Cadastros</span> · Novo Lead</p>
        </header>
        <main className="px-8 py-10 max-w-2xl">
          <h1 className="text-[28px] font-semibold tracking-tight mb-1.5">Cadastrar Lead</h1>
          <p className="text-[14px] text-slate-400 mb-8">Preencha as informações do novo cadastro.</p>
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-7 space-y-5">
            {[
              { label: 'Nome completo', placeholder: 'Maria Silva' },
              { label: 'Telefone', placeholder: '(11) 99999-0000' },
              { label: 'Origem', placeholder: 'Instagram, indicação…' },
            ].map((f) => (
              <div key={f.label}>
                <label className="block text-[12px] font-medium text-slate-300 mb-1.5">{f.label}</label>
                <input className="w-full h-11 px-3.5 rounded-lg bg-white/[0.04] border border-white/10 text-[14px] placeholder:text-slate-500 focus:outline-none focus:border-violet-400/60 focus:ring-2 focus:ring-violet-400/20" placeholder={f.placeholder} />
              </div>
            ))}
            <div>
              <label className="block text-[12px] font-medium text-slate-300 mb-2">Tipo</label>
              <div className="grid grid-cols-2 gap-3">
                {[{ t: 'Cadastro', d: 'Lead novo' }, { t: 'Resgate', d: 'Lead recuperado' }].map((o, i) => (
                  <button key={o.t} className={`text-left rounded-xl p-3.5 border transition-all ${i === 0 ? 'border-violet-400/60 bg-violet-400/10' : 'border-white/10 bg-white/[0.02]'}`}>
                    <p className="text-[14px] font-medium">{o.t}</p>
                    <p className="text-[12px] text-slate-400 mt-0.5">{o.d}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[{ k: 'Interagiu', v: true }, { k: 'Agendou', v: true }, { k: 'Pagamento', v: false }].map((o) => (
                <div key={o.k} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-3.5 h-11">
                  <span className="text-[13px] text-slate-200">{o.k}</span>
                  <span className={`relative inline-flex h-5 w-9 rounded-full ${o.v ? 'bg-violet-500' : 'bg-white/15'}`}>
                    <span className={`inline-block h-4 w-4 mt-0.5 rounded-full bg-white transition-transform ${o.v ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </span>
                </div>
              ))}
            </div>
            <div>
              <label className="block text-[12px] font-medium text-slate-300 mb-1.5">Responsável</label>
              <select className="w-full h-11 px-3.5 rounded-lg bg-white/[0.04] border border-white/10 text-[14px]">
                <option>Rayssa</option>
                <option>Maria Eduarda</option>
                <option>Adriele</option>
              </select>
            </div>
            <div className="flex gap-3 pt-4 border-t border-white/[0.06]">
              <button className="h-11 px-4 rounded-lg border border-white/10 text-[13px] text-slate-300">Limpar</button>
              <button className="h-11 px-6 ml-auto rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 text-[14px] font-semibold text-white">Cadastrar Lead</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export function StripeEmpresa() {
  return (
    <div className={`${bgClass} flex`} style={bgStyle}>
      <Sidebar active="empresa" />
      <div className="flex-1 min-w-0">
        <header className="border-b border-white/5 h-16 flex items-center px-8 gap-6">
          <p className="text-sm text-slate-300"><span className="text-slate-500">Configurações</span> · Empresa & Equipe</p>
        </header>
        <main className="px-8 py-10 max-w-3xl space-y-5">
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 flex items-center gap-5">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-500 grid place-items-center text-white font-bold text-xl">IT</div>
            <div className="flex-1">
              <p className="text-[12px] uppercase tracking-wider text-violet-300/80">Empresa</p>
              <h2 className="text-[20px] font-semibold tracking-tight mt-1">{m.empresa}</h2>
              <p className="text-[13px] text-slate-400 mt-1">Clínica · Dono: João Pereira · {m.members.length} membros</p>
            </div>
            <span className="px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-violet-400/15 text-violet-200">Você é Owner</span>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
            <h3 className="text-[14px] font-semibold mb-4">Convidar pessoa</h3>
            <div className="grid grid-cols-[1fr_140px_auto] gap-3">
              <input className="h-11 px-3.5 rounded-lg bg-white/[0.04] border border-white/10 text-[14px] placeholder:text-slate-500" placeholder="email@empresa.com" />
              <select className="h-11 px-3.5 rounded-lg bg-white/[0.04] border border-white/10 text-[14px]">
                <option>Membro</option>
                <option>Admin</option>
              </select>
              <button className="h-11 px-5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 text-[14px] font-semibold text-white">Enviar convite</button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-[14px] font-semibold">Membros</h3>
              <span className="text-[12px] text-slate-400">{m.members.length} pessoas</span>
            </div>
            <ul>
              {m.members.map((u, i) => (
                <li key={u.email} className={`flex items-center gap-3 px-6 h-14 ${i < m.members.length - 1 ? 'border-b border-white/[0.04]' : ''}`}>
                  <span className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 grid place-items-center text-[12px] font-bold text-white">
                    {u.nome.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium truncate">{u.nome}</p>
                    <p className="text-[12px] text-slate-400 truncate">{u.email}</p>
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border border-white/10 text-slate-300">{u.role}</span>
                </li>
              ))}
            </ul>
          </div>
        </main>
      </div>
    </div>
  )
}

export const stripeVariant = {
  login: StripeLogin,
  dashboard: StripeDashboard,
  lead: StripeLead,
  empresa: StripeEmpresa,
} as const satisfies Record<PreviewSection, () => React.JSX.Element>
