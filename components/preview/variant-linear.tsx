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

function Sidebar({ active }: { active: string }) {
  return (
    <aside className="w-[220px] shrink-0 border-r border-white/[0.06] bg-[#08090c] h-screen sticky top-0">
      <div className="px-5 h-12 flex items-center border-b border-white/[0.06]">
        <span className="text-[13px] font-semibold tracking-tight text-slate-100">cadastra<span className="text-violet-400">.</span>ai</span>
      </div>
      <nav className="p-2 space-y-px">
        {navItems.map((n) => (
          <a
            key={n.id}
            className={`block px-3 h-8 rounded text-[12px] flex items-center ${
              active === n.id ? 'bg-white/[0.06] text-slate-100' : 'text-slate-500 hover:text-slate-200'
            }`}
          >
            {n.label}
          </a>
        ))}
      </nav>
    </aside>
  )
}

export function LinearLogin() {
  return (
    <div className="min-h-screen bg-[#08090c] text-slate-100 grid grid-cols-2 font-sans">
      <div className="border-r border-white/[0.06] p-12 flex flex-col justify-between">
        <div>
          <span className="text-[13px] font-semibold tracking-tight">cadastra<span className="text-violet-400">.</span>ai</span>
          <h1 className="text-[42px] font-semibold tracking-tight mt-24 leading-[1.05] max-w-md">
            Sistema de cadastro<br />
            <span className="text-slate-500">para clínicas modernas.</span>
          </h1>
          <p className="text-[14px] text-slate-500 mt-4 max-w-sm">
            Leads, consultas, tratamentos e recebimentos num só painel. Convide sua equipe por e-mail.
          </p>
        </div>
        <div className="text-[12px] text-slate-600">© 2026 cadastra.ai</div>
      </div>
      <div className="flex items-center justify-center p-12">
        <div className="w-full max-w-sm">
          <h2 className="text-[20px] font-semibold mb-1">Entrar</h2>
          <p className="text-[13px] text-slate-500 mb-8">Acesse seu painel.</p>
          <button className="w-full h-10 rounded-md border border-white/[0.08] bg-white/[0.03] text-[13px] hover:bg-white/[0.06] transition-colors mb-3">
            Continuar com Google
          </button>
          <div className="flex items-center my-5">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="px-3 text-[11px] text-slate-600 uppercase tracking-wider">ou</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>
          <label className="block text-[11px] uppercase tracking-wider text-slate-500 mb-1.5">E-mail</label>
          <input
            placeholder="seu@email.com"
            className="w-full h-10 px-3 mb-4 rounded-md bg-white/[0.03] border border-white/[0.08] text-[13px] text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-violet-400/40"
          />
          <label className="block text-[11px] uppercase tracking-wider text-slate-500 mb-1.5">Senha</label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full h-10 px-3 mb-6 rounded-md bg-white/[0.03] border border-white/[0.08] text-[13px] text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-violet-400/40"
          />
          <button className="w-full h-10 rounded-md bg-violet-500 hover:bg-violet-400 text-[13px] font-medium text-white transition-colors">
            Entrar
          </button>
          <p className="text-[12px] text-center text-slate-500 mt-5">Não tem conta? <a className="text-violet-300 hover:text-violet-200">Criar conta</a></p>
        </div>
      </div>
    </div>
  )
}

export function LinearDashboard() {
  return (
    <div className="min-h-screen bg-[#08090c] text-slate-100 flex font-sans">
      <Sidebar active="dashboard" />
      <div className="flex-1 min-w-0">
        <div className="border-b border-white/[0.06] h-12 flex items-center px-8 text-[12px] gap-3">
          <span className="text-slate-500">{m.empresa}</span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-300">Indicadores</span>
          <div className="ml-auto inline-flex items-center gap-0.5 rounded border border-white/[0.06] p-0.5">
            {['Hoje', 'Semana', 'Mês'].map((p, i) => (
              <button key={p} className={`h-7 px-2.5 rounded text-[11px] font-medium ${i === 1 ? 'bg-white/[0.06] text-slate-100' : 'text-slate-500 hover:text-slate-200'}`}>{p}</button>
            ))}
          </div>
        </div>
        <main className="px-8 py-8 max-w-[1200px]">
          <div className="grid grid-cols-4 gap-px bg-white/[0.06] rounded-lg overflow-hidden mb-px">
            {[
              { label: 'Leads', value: m.totalLeads, delta: '+12.3%' },
              { label: 'Consultas', value: m.consultas, delta: '+8.1%' },
              { label: 'Tratamentos', value: m.tratamentos, delta: '+22.4%' },
              { label: 'Receita', value: brl(m.receita), delta: '+18.2%' },
            ].map((k) => (
              <div key={k.label} className="bg-[#0c0d11] p-5">
                <span className="text-[11px] text-slate-500 uppercase tracking-wider">{k.label}</span>
                <p className="text-[28px] font-semibold tabular-nums text-slate-50 leading-none mt-2">{k.value}</p>
                <p className="mt-2 text-[11px] text-emerald-400 tabular-nums">{k.delta}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-px bg-white/[0.06] rounded-lg overflow-hidden mt-px">
            <div className="bg-[#0c0d11] p-5 col-span-2">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider">Funil</span>
              <div className="space-y-3 mt-4">
                {[
                  { label: 'Leads', n: m.totalLeads, pct: 100 },
                  { label: 'Agendamentos', n: m.agendamentos, pct: Math.round((m.agendamentos / m.totalLeads) * 100) },
                  { label: 'Consultas', n: m.consultas, pct: Math.round((m.consultas / m.totalLeads) * 100) },
                  { label: 'Tratamentos', n: m.tratamentos, pct: Math.round((m.tratamentos / m.totalLeads) * 100) },
                ].map((s) => (
                  <div key={s.label} className="grid grid-cols-[120px_1fr_60px_44px] gap-3 items-center text-[13px]">
                    <span className="text-slate-300">{s.label}</span>
                    <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
                      <div className="h-full bg-violet-400" style={{ width: `${s.pct}%` }} />
                    </div>
                    <span className="text-right text-slate-400 tabular-nums">{s.n}</span>
                    <span className="text-right text-slate-500 tabular-nums text-[11px]">{s.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#0c0d11] p-5">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider">Origens</span>
              <ul className="mt-4 space-y-2.5">
                {m.origens.map((o) => (
                  <li key={o.nome} className="flex items-center justify-between text-[13px]">
                    <span className="text-slate-300">{o.nome}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-1 bg-white/[0.04] rounded-full overflow-hidden">
                        <div className="h-full bg-slate-300" style={{ width: `${o.pct}%` }} />
                      </div>
                      <span className="text-slate-400 tabular-nums w-8 text-right">{o.count}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export function LinearLead() {
  return (
    <div className="min-h-screen bg-[#08090c] text-slate-100 flex font-sans">
      <Sidebar active="lead" />
      <div className="flex-1 min-w-0">
        <div className="border-b border-white/[0.06] h-12 flex items-center px-8 text-[12px] gap-3">
          <span className="text-slate-500">{m.empresa}</span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-300">Cadastrar Lead</span>
        </div>
        <main className="px-8 py-10 max-w-2xl">
          <h1 className="text-[20px] font-semibold tracking-tight mb-1">Novo Lead</h1>
          <p className="text-[13px] text-slate-500 mb-8">Cadastro geral. Os campos com * são obrigatórios.</p>
          <div className="space-y-5">
            {[
              { label: 'Nome', placeholder: 'Maria Silva' },
              { label: 'Telefone', placeholder: '(11) 99999-0000' },
              { label: 'Origem', placeholder: 'Instagram, indicação…' },
            ].map((f) => (
              <div key={f.label}>
                <label className="block text-[11px] uppercase tracking-wider text-slate-500 mb-1.5">{f.label} *</label>
                <input className="w-full h-10 px-3 rounded-md bg-white/[0.03] border border-white/[0.08] text-[13px] text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-violet-400/40" placeholder={f.placeholder} />
              </div>
            ))}
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-slate-500 mb-2">Tipo *</label>
              <div className="grid grid-cols-2 gap-2">
                {['Cadastro', 'Resgate'].map((t, i) => (
                  <button key={t} className={`h-10 rounded-md text-[13px] border ${i === 0 ? 'border-violet-400/50 bg-violet-400/10 text-slate-100' : 'border-white/[0.08] text-slate-400 hover:text-slate-100'}`}>{t}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['Interagiu', 'Agendou', 'Pago'].map((t, i) => (
                <button key={t} className={`h-10 rounded-md text-[13px] border ${i < 2 ? 'border-violet-400/50 bg-violet-400/10 text-slate-100' : 'border-white/[0.08] text-slate-400'}`}>
                  {t}: {i < 2 ? 'Sim' : 'Não'}
                </button>
              ))}
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-slate-500 mb-1.5">Responsável *</label>
              <select className="w-full h-10 px-3 rounded-md bg-white/[0.03] border border-white/[0.08] text-[13px] text-slate-100">
                <option>Rayssa</option>
                <option>Maria Eduarda</option>
                <option>Adriele</option>
              </select>
            </div>
            <div className="flex gap-2 pt-3 border-t border-white/[0.06]">
              <button className="h-10 px-4 rounded-md border border-white/[0.08] text-[13px] text-slate-400">Limpar</button>
              <button className="h-10 px-5 ml-auto rounded-md bg-violet-500 hover:bg-violet-400 text-[13px] font-medium text-white">Cadastrar Lead</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export function LinearEmpresa() {
  return (
    <div className="min-h-screen bg-[#08090c] text-slate-100 flex font-sans">
      <Sidebar active="empresa" />
      <div className="flex-1 min-w-0">
        <div className="border-b border-white/[0.06] h-12 flex items-center px-8 text-[12px] gap-3">
          <span className="text-slate-500">{m.empresa}</span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-300">Empresa & Equipe</span>
        </div>
        <main className="px-8 py-10 max-w-3xl space-y-6">
          <div className="rounded-lg border border-white/[0.06] bg-[#0c0d11] p-5">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider">Empresa</span>
            <h2 className="text-[18px] font-semibold mt-1">{m.empresa}</h2>
            <p className="text-[12px] text-slate-500 mt-1">Clínica · {m.members.length} membros · 2 convites pendentes</p>
          </div>

          <div className="rounded-lg border border-white/[0.06] bg-[#0c0d11] p-5">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider">Convidar pessoa</span>
            <div className="grid grid-cols-[1fr_140px_auto] gap-2 mt-4">
              <input className="h-10 px-3 rounded-md bg-white/[0.03] border border-white/[0.08] text-[13px] placeholder:text-slate-600" placeholder="email@empresa.com" />
              <select className="h-10 px-3 rounded-md bg-white/[0.03] border border-white/[0.08] text-[13px]">
                <option>Membro</option>
                <option>Admin</option>
              </select>
              <button className="h-10 px-4 rounded-md bg-violet-500 hover:bg-violet-400 text-[13px] font-medium text-white">Enviar</button>
            </div>
          </div>

          <div className="rounded-lg border border-white/[0.06] bg-[#0c0d11] overflow-hidden">
            <div className="px-5 h-10 flex items-center border-b border-white/[0.06]">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider">Membros</span>
            </div>
            <ul>
              {m.members.map((u) => (
                <li key={u.email} className="flex items-center gap-3 px-5 h-12 border-b border-white/[0.04] last:border-b-0">
                  <span className="h-7 w-7 rounded-full bg-violet-500/30 grid place-items-center text-[11px] font-semibold">
                    {u.nome.slice(0, 1)}
                  </span>
                  <span className="text-[13px] text-slate-200 flex-1">{u.nome}</span>
                  <span className="text-[12px] text-slate-500">{u.email}</span>
                  <span className="text-[11px] text-slate-400 px-2 py-0.5 rounded border border-white/[0.08]">{u.role}</span>
                </li>
              ))}
            </ul>
          </div>
        </main>
      </div>
    </div>
  )
}

export const linearVariant = {
  login: LinearLogin,
  dashboard: LinearDashboard,
  lead: LinearLead,
  empresa: LinearEmpresa,
} as const satisfies Record<PreviewSection, () => React.JSX.Element>
