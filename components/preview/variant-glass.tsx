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

function MeshBackdrop() {
  return (
    <div
      className="pointer-events-none fixed inset-0"
      style={{
        background:
          'radial-gradient(at 15% 20%, rgba(124,58,237,0.45), transparent 45%), radial-gradient(at 85% 75%, rgba(34,211,238,0.30), transparent 50%), radial-gradient(at 50% 100%, rgba(236,72,153,0.20), transparent 55%)',
      }}
    />
  )
}

function Sidebar({ active }: { active: string }) {
  return (
    <aside
      className="w-[244px] shrink-0 h-screen sticky top-0 border-r border-white/10 backdrop-blur-xl px-3 py-5"
      style={{ background: 'rgba(10,4,32,0.5)' }}
    >
      <div className="flex items-center gap-2.5 px-2 mb-7">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-300 to-fuchsia-400 shadow-lg" />
        <div className="leading-tight">
          <p className="text-[10px] tracking-[0.18em] uppercase text-white/45">cadastra.ai</p>
          <p className="text-[13px] font-medium text-white">{m.empresa}</p>
        </div>
      </div>
      <nav className="space-y-1">
        {navItems.map((n) => (
          <a
            key={n.id}
            className={`block px-3.5 h-10 rounded-xl text-[13px] flex items-center transition-colors ${
              active === n.id
                ? 'bg-white/15 text-white border border-white/15 backdrop-blur-md'
                : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            {n.label}
          </a>
        ))}
      </nav>
    </aside>
  )
}

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-3xl border border-white/15 backdrop-blur-xl ${className}`}
      style={{ background: 'rgba(255,255,255,0.04)' }}
    >
      {children}
    </div>
  )
}

export function GlassLogin() {
  return (
    <div className="relative min-h-screen text-white font-sans" style={{ background: '#0a0420' }}>
      <MeshBackdrop />
      <div className="relative grid grid-cols-2 min-h-screen">
        <div className="p-12 flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-300 to-fuchsia-400" />
            <span className="text-base font-semibold">cadastra.ai</span>
          </div>
          <div className="space-y-6 max-w-md">
            <h1 className="text-[48px] font-extralight leading-[1.05] tracking-tight">
              Tudo que sua clínica precisa,
              <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-fuchsia-300"> em um só lugar.</span>
            </h1>
            <p className="text-white/60 text-[15px] leading-relaxed">
              Leads, consultas, tratamentos e financeiro. Convide sua equipe e cresça com clareza.
            </p>
          </div>
          <div className="text-[12px] text-white/40">© 2026 cadastra.ai</div>
        </div>
        <div className="flex items-center justify-center p-12">
          <GlassCard className="w-full max-w-sm p-8">
            <h2 className="text-[24px] font-light tracking-tight mb-1">Entrar</h2>
            <p className="text-[13px] text-white/55 mb-7">Acesse seu painel.</p>
            <button className="w-full h-11 rounded-xl border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] text-[14px] mb-4">
              Continuar com Google
            </button>
            <div className="flex items-center my-5">
              <div className="flex-1 h-px bg-white/10" />
              <span className="px-3 text-[11px] text-white/40 uppercase tracking-wider">ou</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
            <input placeholder="seu@email.com" className="w-full h-11 px-4 mb-3 rounded-xl bg-white/[0.04] border border-white/10 text-[14px] placeholder:text-white/35 focus:outline-none focus:border-cyan-300/60" />
            <input type="password" placeholder="Senha" className="w-full h-11 px-4 mb-6 rounded-xl bg-white/[0.04] border border-white/10 text-[14px] placeholder:text-white/35 focus:outline-none focus:border-cyan-300/60" />
            <button className="w-full h-11 rounded-xl bg-white text-slate-900 font-semibold text-[14px] hover:bg-white/95">
              Entrar
            </button>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}

export function GlassDashboard() {
  return (
    <div className="relative min-h-screen text-white font-sans flex" style={{ background: '#0a0420' }}>
      <MeshBackdrop />
      <div className="relative flex w-full">
        <Sidebar active="dashboard" />
        <div className="flex-1 min-w-0">
          <header className="border-b border-white/10 backdrop-blur-md h-16 flex items-center px-8 gap-6" style={{ background: 'rgba(10,4,32,0.45)' }}>
            <p className="text-sm">Painel · {m.empresa}</p>
            <div className="ml-auto inline-flex items-center rounded-full border border-white/15 bg-white/[0.04] backdrop-blur-md p-1">
              {['Hoje', 'Semana', 'Mês'].map((p, i) => (
                <button key={p} className={`h-8 px-4 rounded-full text-[12px] ${i === 1 ? 'bg-white text-slate-900 font-semibold' : 'text-white/65'}`}>{p}</button>
              ))}
            </div>
          </header>
          <main className="px-8 py-10 max-w-[1200px]">
            <h1 className="text-[40px] font-extralight tracking-tight mb-10 max-w-2xl leading-[1.05]">
              Indicadores em tempo real,
              <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-fuchsia-300"> ao seu alcance.</span>
            </h1>
            <div className="grid grid-cols-3 gap-5 mb-5">
              <GlassCard className="col-span-1 p-7">
                <p className="text-[11px] tracking-[0.18em] uppercase text-white/55 mb-3">Receita</p>
                <p className="text-[44px] font-light tabular-nums leading-none">{brl(m.receita)}</p>
                <p className="text-[12px] text-emerald-300 mt-3 tabular-nums">+18.2%</p>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {m.formas.slice(0, 4).map((f, i) => {
                    const colors = ['from-cyan-300 to-cyan-500', 'from-violet-300 to-violet-500', 'from-amber-300 to-amber-500', 'from-rose-300 to-rose-500']
                    return (
                      <div key={f.forma} className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
                        <p className="text-[10px] uppercase tracking-wider text-white/45">{f.forma}</p>
                        <p className="text-[15px] font-medium mt-1 tabular-nums">{brl(f.valor)}</p>
                        <div className="h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                          <div className={`h-full bg-gradient-to-r ${colors[i]}`} style={{ width: `${f.pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </GlassCard>
              <div className="col-span-2 grid grid-cols-2 gap-5">
                {[
                  { label: 'Leads', value: m.totalLeads, delta: '+12.3%' },
                  { label: 'Consultas', value: m.consultas, delta: '+8.1%' },
                  { label: 'Tratamentos', value: m.tratamentos, delta: '+22.4%' },
                  { label: 'Ticket médio', value: brl(m.ticketMedio), delta: '+5.6%' },
                ].map((k) => (
                  <GlassCard key={k.label} className="p-6">
                    <p className="text-[11px] tracking-[0.18em] uppercase text-white/55 mb-3">{k.label}</p>
                    <p className="text-[34px] font-light tabular-nums leading-none">{k.value}</p>
                    <p className="text-[12px] text-emerald-300 mt-3 tabular-nums">{k.delta}</p>
                  </GlassCard>
                ))}
              </div>
            </div>
            <GlassCard className="p-7">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[16px] font-medium">Origem dos leads</h3>
                <span className="text-[11px] tracking-widest uppercase text-white/45">{m.totalLeads} no total</span>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {m.origens.map((o, i) => {
                  const colors = ['from-cyan-300 to-cyan-500', 'from-violet-300 to-violet-500', 'from-fuchsia-300 to-fuchsia-500', 'from-emerald-300 to-emerald-500']
                  return (
                    <div key={o.nome} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-[12px] text-white/60">{o.nome}</p>
                      <p className="text-[26px] font-light tabular-nums mt-1">{o.count}</p>
                      <div className="h-1 bg-white/10 rounded-full mt-3 overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${colors[i]}`} style={{ width: `${o.pct}%` }} />
                      </div>
                      <p className="text-[10px] text-white/40 mt-2 tabular-nums">{o.pct}%</p>
                    </div>
                  )
                })}
              </div>
            </GlassCard>
          </main>
        </div>
      </div>
    </div>
  )
}

export function GlassLead() {
  return (
    <div className="relative min-h-screen text-white font-sans flex" style={{ background: '#0a0420' }}>
      <MeshBackdrop />
      <div className="relative flex w-full">
        <Sidebar active="lead" />
        <div className="flex-1 min-w-0">
          <header className="border-b border-white/10 backdrop-blur-md h-16 flex items-center px-8" style={{ background: 'rgba(10,4,32,0.45)' }}>
            <p className="text-sm">Cadastros · Novo Lead</p>
          </header>
          <main className="px-8 py-10 max-w-2xl">
            <h1 className="text-[36px] font-extralight tracking-tight mb-2">Cadastrar Lead</h1>
            <p className="text-[14px] text-white/55 mb-8">Preencha as informações para registrar um novo lead.</p>
            <GlassCard className="p-7 space-y-5">
              {[
                { label: 'Nome completo', placeholder: 'Maria Silva' },
                { label: 'Telefone', placeholder: '(11) 99999-0000' },
                { label: 'Origem', placeholder: 'Instagram, indicação…' },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-[12px] font-medium text-white/65 mb-2">{f.label}</label>
                  <input className="w-full h-11 px-3.5 rounded-xl bg-white/[0.04] border border-white/15 text-[14px] placeholder:text-white/35 focus:outline-none focus:border-cyan-300/60" placeholder={f.placeholder} />
                </div>
              ))}
              <div>
                <label className="block text-[12px] font-medium text-white/65 mb-2">Tipo</label>
                <div className="grid grid-cols-2 gap-3">
                  {[{ t: 'Cadastro', d: 'Lead novo' }, { t: 'Resgate', d: 'Lead recuperado' }].map((o, i) => (
                    <button key={o.t} className={`text-left rounded-2xl p-4 border transition-colors ${i === 0 ? 'border-white/30 bg-white/10' : 'border-white/10 bg-white/[0.02]'}`}>
                      <p className="text-[14px] font-medium">{o.t}</p>
                      <p className="text-[12px] text-white/55 mt-0.5">{o.d}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button className="h-11 px-4 rounded-xl border border-white/15 text-[13px] text-white/65">Limpar</button>
                <button className="h-11 px-6 ml-auto rounded-xl bg-white text-slate-900 font-semibold text-[14px]">Cadastrar Lead</button>
              </div>
            </GlassCard>
          </main>
        </div>
      </div>
    </div>
  )
}

export function GlassEmpresa() {
  return (
    <div className="relative min-h-screen text-white font-sans flex" style={{ background: '#0a0420' }}>
      <MeshBackdrop />
      <div className="relative flex w-full">
        <Sidebar active="empresa" />
        <div className="flex-1 min-w-0">
          <header className="border-b border-white/10 backdrop-blur-md h-16 flex items-center px-8" style={{ background: 'rgba(10,4,32,0.45)' }}>
            <p className="text-sm">Configurações · Empresa & Equipe</p>
          </header>
          <main className="px-8 py-10 max-w-3xl space-y-5">
            <GlassCard className="p-6 flex items-center gap-5">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-300 to-fuchsia-400 grid place-items-center font-bold text-slate-900 text-xl">IT</div>
              <div className="flex-1">
                <p className="text-[12px] uppercase tracking-wider text-white/45">Empresa</p>
                <h2 className="text-[22px] font-light tracking-tight mt-1">{m.empresa}</h2>
                <p className="text-[13px] text-white/55 mt-1">Clínica · Dono: João Pereira · {m.members.length} membros</p>
              </div>
              <span className="px-3 py-1 rounded-full text-[11px] font-medium uppercase tracking-wider bg-white/10 border border-white/15">Owner</span>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="text-[14px] font-medium mb-4">Convidar pessoa</h3>
              <div className="grid grid-cols-[1fr_140px_auto] gap-3">
                <input className="h-11 px-3.5 rounded-xl bg-white/[0.04] border border-white/15 text-[14px] placeholder:text-white/35" placeholder="email@empresa.com" />
                <select className="h-11 px-3.5 rounded-xl bg-white/[0.04] border border-white/15 text-[14px]">
                  <option>Membro</option>
                  <option>Admin</option>
                </select>
                <button className="h-11 px-5 rounded-xl bg-white text-slate-900 font-semibold text-[14px]">Enviar</button>
              </div>
            </GlassCard>

            <GlassCard className="overflow-hidden">
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-[14px] font-medium">Membros</h3>
                <span className="text-[12px] text-white/55">{m.members.length} pessoas</span>
              </div>
              <ul>
                {m.members.map((u, i) => (
                  <li key={u.email} className={`flex items-center gap-3 px-6 h-14 ${i < m.members.length - 1 ? 'border-b border-white/[0.06]' : ''}`}>
                    <span className="h-9 w-9 rounded-full bg-gradient-to-br from-cyan-300 to-fuchsia-400 grid place-items-center text-[12px] font-bold text-slate-900">
                      {u.nome.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px]">{u.nome}</p>
                      <p className="text-[12px] text-white/55 truncate">{u.email}</p>
                    </div>
                    <span className="text-[11px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-md border border-white/15 text-white/75">{u.role}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </main>
        </div>
      </div>
    </div>
  )
}

export const glassVariant = {
  login: GlassLogin,
  dashboard: GlassDashboard,
  lead: GlassLead,
  empresa: GlassEmpresa,
} as const satisfies Record<PreviewSection, () => React.JSX.Element>
