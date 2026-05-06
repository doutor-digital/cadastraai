'use client'

import { previewMock as m, brl, type PreviewSection } from './mock-data'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '◉' },
  { id: 'lead', label: 'Cadastrar Lead', icon: '◎' },
  { id: 'consulta', label: 'Cadastrar Consulta', icon: '◐' },
  { id: 'tratamento', label: 'Tratamentos', icon: '◑' },
  { id: 'recebimentos', label: 'Recebimentos', icon: '◒' },
  { id: 'empresa', label: 'Empresa & Equipe', icon: '◓' },
]

function Sidebar({ active }: { active: string }) {
  return (
    <aside className="w-[240px] shrink-0 h-screen sticky top-0 bg-[#101115] border-r border-white/[0.06] p-3">
      <div className="flex items-center gap-2 px-2 h-12 mb-2">
        <div className="h-7 w-7 rounded-lg bg-emerald-400" />
        <span className="text-sm font-bold tracking-tight">cadastra.ai</span>
      </div>
      <nav className="space-y-1">
        {navItems.map((n) => (
          <a
            key={n.id}
            className={`flex items-center gap-2.5 px-3 h-10 rounded-xl text-[13px] transition-colors ${
              active === n.id ? 'bg-white text-slate-900 font-semibold' : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <span className={active === n.id ? 'text-emerald-500' : 'text-white/40'}>{n.icon}</span>
            {n.label}
          </a>
        ))}
      </nav>
    </aside>
  )
}

export function BentoLogin() {
  return (
    <div className="min-h-screen bg-[#0c0d10] text-white font-sans grid grid-cols-2">
      <div className="p-12 flex flex-col justify-between bg-gradient-to-br from-emerald-500 to-emerald-700 text-emerald-50">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-white" />
          <span className="text-base font-bold tracking-tight text-white">cadastra.ai</span>
        </div>
        <div>
          <p className="text-[12px] uppercase tracking-[0.2em] text-emerald-100/80 mb-3">Trauma OS · v1</p>
          <h1 className="text-[64px] font-bold leading-[0.95] tracking-tight">
            Cadastre.<br />Atenda.<br />Cresça.
          </h1>
          <p className="mt-6 text-[16px] text-emerald-100/80 max-w-sm">
            Sistema de cadastro completo para clínicas e consultórios. Tudo num só painel.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { n: '247', l: 'leads/mês' },
            { n: '84', l: 'tratamentos' },
            { n: brl(124320), l: 'receita' },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl bg-emerald-100/10 border border-emerald-100/20 p-3">
              <p className="text-[20px] font-bold tabular-nums">{s.n}</p>
              <p className="text-[10px] uppercase tracking-wider text-emerald-100/70">{s.l}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-center p-12 bg-[#0c0d10]">
        <div className="w-full max-w-sm">
          <h2 className="text-[36px] font-bold tracking-tight leading-none mb-2">Entrar</h2>
          <p className="text-[14px] text-white/55 mb-7">Acesse seu painel.</p>
          <button className="w-full h-12 rounded-2xl bg-[#15171b] border border-white/[0.05] text-[14px] hover:bg-[#1a1c20] mb-3">
            Continuar com Google
          </button>
          <div className="flex items-center my-5">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="px-3 text-[11px] text-white/45 uppercase tracking-wider">ou</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>
          <input placeholder="seu@email.com" className="w-full h-12 px-4 mb-3 rounded-2xl bg-[#15171b] border border-white/[0.05] text-[14px] placeholder:text-white/35 focus:outline-none focus:border-emerald-400/60" />
          <input type="password" placeholder="Senha" className="w-full h-12 px-4 mb-6 rounded-2xl bg-[#15171b] border border-white/[0.05] text-[14px] placeholder:text-white/35 focus:outline-none focus:border-emerald-400/60" />
          <button className="w-full h-12 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-900 font-semibold text-[14px]">Entrar</button>
        </div>
      </div>
    </div>
  )
}

export function BentoDashboard() {
  return (
    <div className="min-h-screen bg-[#0c0d10] text-white font-sans flex">
      <Sidebar active="dashboard" />
      <div className="flex-1 min-w-0">
        <header className="border-b border-white/[0.06] h-14 flex items-center px-8 gap-4">
          <span className="text-xs text-white/60">{m.empresa}</span>
          <div className="ml-auto flex items-center gap-1">
            {['Hoje', 'Semana', 'Mês'].map((p, i) => (
              <button key={p} className={`h-7 px-3 rounded-md text-[12px] ${i === 1 ? 'bg-emerald-400 text-slate-900 font-semibold' : 'text-white/60'}`}>{p}</button>
            ))}
          </div>
        </header>
        <main className="px-8 py-8 max-w-[1280px]">
          <div className="grid grid-cols-6 gap-3" style={{ gridAutoRows: '160px' }}>
            <div className="col-span-3 row-span-2 rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-7 flex flex-col justify-between text-emerald-50">
              <div>
                <p className="text-[12px] uppercase tracking-[0.2em] text-emerald-100/80">Receita acumulada</p>
                <p className="text-[12px] text-emerald-100/60 mt-1">Últimos 30 dias</p>
              </div>
              <div>
                <p className="text-[64px] font-bold tabular-nums leading-none tracking-tight">{brl(m.receita)}</p>
                <div className="flex items-center gap-3 mt-4 text-[12px]">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100/20 font-semibold tabular-nums">+18.2%</span>
                  <span className="text-emerald-100/70">vs período anterior</span>
                </div>
              </div>
            </div>
            <div className="col-span-2 row-span-1 rounded-3xl bg-[#15171b] border border-white/[0.05] p-6 flex flex-col justify-between">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">Leads</p>
              <div>
                <p className="text-[40px] font-bold tabular-nums leading-none">{m.totalLeads}</p>
                <p className="text-[11px] text-emerald-400 mt-2 tabular-nums">+12.3%</p>
              </div>
            </div>
            <div className="col-span-1 row-span-1 rounded-3xl bg-[#15171b] border border-white/[0.05] p-5 flex flex-col justify-between">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">Fechados</p>
              <div>
                <p className="text-[36px] font-bold tabular-nums leading-none">{m.tratamentos}</p>
                <p className="text-[11px] text-emerald-400 mt-1 tabular-nums">+22%</p>
              </div>
            </div>
            <div className="col-span-3 row-span-1 rounded-3xl bg-[#15171b] border border-white/[0.05] p-6">
              <div className="flex items-baseline justify-between mb-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">Funil</p>
                <p className="text-[12px] text-white/45 tabular-nums">{m.totalLeads} → {m.tratamentos}</p>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Leads', n: m.totalLeads },
                  { label: 'Agendou', n: m.agendamentos },
                  { label: 'Consulta', n: m.consultas },
                  { label: 'Tratou', n: m.tratamentos },
                ].map((s, i) => (
                  <div key={s.label} className="text-center">
                    <div className="h-12 rounded-lg flex items-end justify-center" style={{ background: `linear-gradient(180deg, transparent ${100 - (s.n / m.totalLeads) * 100}%, rgba(52,211,153,0.6) ${100 - (s.n / m.totalLeads) * 100}%)` }}>
                      <span className="text-[14px] font-semibold tabular-nums pb-1">{s.n}</span>
                    </div>
                    <p className="text-[10px] text-white/50 mt-1.5 tracking-wider uppercase">{s.label}</p>
                    {i > 0 && <p className="text-[9px] text-emerald-400 tabular-nums">{Math.round((s.n / m.totalLeads) * 100)}%</p>}
                  </div>
                ))}
              </div>
            </div>
            <div className="col-span-2 row-span-2 rounded-3xl bg-[#15171b] border border-white/[0.05] p-6">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/50 mb-5">Top origens</p>
              <div className="space-y-4">
                {m.origens.map((o) => (
                  <div key={o.nome}>
                    <div className="flex items-baseline justify-between mb-1.5">
                      <span className="text-[14px] font-medium">{o.nome}</span>
                      <span className="text-[12px] text-white/45 tabular-nums">{o.count}</span>
                    </div>
                    <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400" style={{ width: `${o.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-span-1 row-span-1 rounded-3xl bg-[#15171b] border border-white/[0.05] p-5 flex flex-col justify-between">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">Ticket</p>
              <div>
                <p className="text-[24px] font-bold tabular-nums leading-none">{brl(m.ticketMedio)}</p>
                <p className="text-[11px] text-emerald-400 mt-1.5 tabular-nums">+5.6%</p>
              </div>
            </div>
            <div className="col-span-3 row-span-1 rounded-3xl bg-[#15171b] border border-white/[0.05] p-5">
              <div className="flex items-baseline justify-between mb-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">Equipe</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {m.responsaveis.map((r, i) => {
                  const accents = ['bg-emerald-400', 'bg-cyan-400', 'bg-violet-400']
                  return (
                    <div key={r.nome} className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`h-2 w-2 rounded-full ${accents[i]}`} />
                        <span className="text-[12px] font-medium">{r.nome}</span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-[18px] font-bold tabular-nums">{r.fechados}</span>
                        <span className="text-[10px] text-white/45 tabular-nums">de {r.leads}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export function BentoLead() {
  return (
    <div className="min-h-screen bg-[#0c0d10] text-white font-sans flex">
      <Sidebar active="lead" />
      <div className="flex-1 min-w-0">
        <header className="border-b border-white/[0.06] h-14 flex items-center px-8">
          <span className="text-xs text-white/60">Cadastros · Novo Lead</span>
        </header>
        <main className="px-8 py-10 max-w-2xl">
          <div className="rounded-3xl bg-gradient-to-br from-emerald-500/10 to-emerald-700/10 border border-emerald-400/20 p-7 mb-6">
            <p className="text-[12px] uppercase tracking-[0.2em] text-emerald-300 mb-2">Novo cadastro</p>
            <h1 className="text-[36px] font-bold tracking-tight leading-none">Cadastrar Lead</h1>
            <p className="text-[14px] text-white/55 mt-2">Preencha as informações do lead. Após salvar, podemos pular direto pra consulta.</p>
          </div>
          <div className="rounded-3xl bg-[#15171b] border border-white/[0.05] p-7 space-y-5">
            {[
              { label: 'Nome', placeholder: 'Maria Silva' },
              { label: 'Telefone', placeholder: '(11) 99999-0000' },
              { label: 'Origem', placeholder: 'Instagram, indicação…' },
            ].map((f) => (
              <div key={f.label}>
                <label className="block text-[12px] font-medium text-white/65 mb-2">{f.label}</label>
                <input className="w-full h-12 px-4 rounded-2xl bg-[#0c0d10] border border-white/[0.05] text-[14px] placeholder:text-white/30 focus:outline-none focus:border-emerald-400/60" placeholder={f.placeholder} />
              </div>
            ))}
            <div>
              <label className="block text-[12px] font-medium text-white/65 mb-2">Tipo</label>
              <div className="grid grid-cols-2 gap-3">
                {[{ t: 'Cadastro', d: 'Lead novo' }, { t: 'Resgate', d: 'Lead recuperado' }].map((o, i) => (
                  <button key={o.t} className={`text-left rounded-2xl p-4 border ${i === 0 ? 'border-emerald-400/60 bg-emerald-400/10' : 'border-white/[0.05] bg-[#0c0d10]'}`}>
                    <p className="text-[14px] font-semibold">{o.t}</p>
                    <p className="text-[12px] text-white/55 mt-0.5">{o.d}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-4 border-t border-white/[0.06]">
              <button className="h-12 px-5 rounded-2xl border border-white/[0.05] text-[13px] text-white/65">Limpar</button>
              <button className="h-12 px-6 ml-auto rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-900 font-semibold text-[14px]">Cadastrar Lead</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export function BentoEmpresa() {
  return (
    <div className="min-h-screen bg-[#0c0d10] text-white font-sans flex">
      <Sidebar active="empresa" />
      <div className="flex-1 min-w-0">
        <header className="border-b border-white/[0.06] h-14 flex items-center px-8">
          <span className="text-xs text-white/60">Configurações · Empresa & Equipe</span>
        </header>
        <main className="px-8 py-10 max-w-3xl space-y-4">
          <div className="rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-7 text-emerald-50 flex items-center gap-5">
            <div className="h-16 w-16 rounded-2xl bg-white grid place-items-center text-emerald-700 font-bold text-xl">IT</div>
            <div className="flex-1">
              <p className="text-[12px] uppercase tracking-[0.2em] text-emerald-100/85">Empresa ativa</p>
              <h2 className="text-[28px] font-bold tracking-tight mt-1">{m.empresa}</h2>
              <p className="text-[13px] text-emerald-100/75 mt-1">Clínica · {m.members.length} membros · 2 convites pendentes</p>
            </div>
            <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-sm">Owner</span>
          </div>

          <div className="rounded-3xl bg-[#15171b] border border-white/[0.05] p-6">
            <h3 className="text-[14px] font-semibold mb-4">Convidar pessoa</h3>
            <div className="grid grid-cols-[1fr_140px_auto] gap-3">
              <input className="h-12 px-4 rounded-2xl bg-[#0c0d10] border border-white/[0.05] text-[14px] placeholder:text-white/30" placeholder="email@empresa.com" />
              <select className="h-12 px-4 rounded-2xl bg-[#0c0d10] border border-white/[0.05] text-[14px]">
                <option>Membro</option>
                <option>Admin</option>
              </select>
              <button className="h-12 px-5 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-900 font-semibold text-[14px]">Enviar</button>
            </div>
          </div>

          <div className="rounded-3xl bg-[#15171b] border border-white/[0.05] overflow-hidden">
            <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <h3 className="text-[14px] font-semibold">Membros</h3>
              <span className="text-[12px] text-white/55">{m.members.length} pessoas</span>
            </div>
            <ul>
              {m.members.map((u, i) => (
                <li key={u.email} className={`flex items-center gap-3 px-6 h-14 ${i < m.members.length - 1 ? 'border-b border-white/[0.04]' : ''}`}>
                  <span className="h-9 w-9 rounded-full bg-emerald-400 grid place-items-center text-[12px] font-bold text-slate-900">
                    {u.nome.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium">{u.nome}</p>
                    <p className="text-[12px] text-white/55 truncate">{u.email}</p>
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/[0.04] text-white/75">{u.role}</span>
                </li>
              ))}
            </ul>
          </div>
        </main>
      </div>
    </div>
  )
}

export const bentoVariant = {
  login: BentoLogin,
  dashboard: BentoDashboard,
  lead: BentoLead,
  empresa: BentoEmpresa,
} as const satisfies Record<PreviewSection, () => React.JSX.Element>
