'use client'

import { previewMock as m, brl, type PreviewSection } from './mock-data'

const navItems = [
  { id: 'dashboard', label: 'DASHBOARD', code: 'D01' },
  { id: 'lead', label: 'NEW::LEAD', code: 'L02' },
  { id: 'consulta', label: 'NEW::CONSULTA', code: 'C03' },
  { id: 'tratamento', label: 'TRATAMENTOS', code: 'T04' },
  { id: 'recebimentos', label: 'RECEBIMENTOS', code: 'R05' },
  { id: 'empresa', label: 'EMPRESA::EQUIPE', code: 'E06' },
]

const bgStyle = {
  backgroundColor: '#050a10',
  backgroundImage: 'radial-gradient(rgba(34, 211, 238, 0.08) 1px, transparent 1px)',
  backgroundSize: '22px 22px',
}

function Bracketed({ children, className = '', accent = 'cyan' }: { children: React.ReactNode; className?: string; accent?: 'cyan' | 'amber' }) {
  const color = accent === 'cyan' ? 'border-cyan-400/60' : 'border-amber-400/60'
  return (
    <div className={`relative ${className}`}>
      <span className={`absolute top-0 left-0 w-2.5 h-2.5 border-t border-l ${color}`} />
      <span className={`absolute top-0 right-0 w-2.5 h-2.5 border-t border-r ${color}`} />
      <span className={`absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l ${color}`} />
      <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r ${color}`} />
      {children}
    </div>
  )
}

function Sidebar({ active }: { active: string }) {
  return (
    <aside className="w-[230px] shrink-0 border-r border-cyan-400/15 h-screen sticky top-0">
      <div className="px-5 h-12 flex items-center border-b border-cyan-400/15">
        <span className="text-[11px] font-bold tracking-[0.3em] text-cyan-300">CADASTRA::AI</span>
      </div>
      <nav className="p-2 space-y-px">
        {navItems.map((n) => (
          <a
            key={n.id}
            className={`block px-3 h-9 flex items-center gap-3 text-[11px] tracking-widest border ${
              active === n.id
                ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-100'
                : 'border-transparent text-cyan-100/55 hover:text-cyan-200 hover:border-cyan-400/15'
            }`}
          >
            <span className="text-cyan-400/60 text-[10px]">{n.code}</span>
            <span>{n.label}</span>
          </a>
        ))}
      </nav>
      <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-cyan-400/15">
        <div className="text-[10px] tracking-widest text-cyan-100/45">// SYS_STATUS</div>
        <div className="flex items-center gap-1.5 mt-1.5 text-[10px]">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-300 tracking-widest">ONLINE</span>
        </div>
      </div>
    </aside>
  )
}

export function CockpitLogin() {
  return (
    <div className="min-h-screen text-cyan-100 font-mono grid grid-cols-2" style={bgStyle}>
      <div className="border-r border-cyan-400/15 p-12 flex flex-col justify-between">
        <div>
          <p className="text-[10px] tracking-[0.3em] text-cyan-400/70">// SYSTEM v1.0.0</p>
          <p className="text-[20px] font-bold tracking-[0.2em] text-cyan-300 mt-2">CADASTRA::AI</p>
        </div>
        <div className="space-y-3">
          <p className="text-[11px] tracking-[0.25em] text-cyan-400/70">// SYSTEM_BOOT</p>
          <pre className="text-[12px] leading-relaxed text-cyan-100/70">
{`> initializing terminal session...
> connecting to railway::postgres ✓
> loading auth::jwt        ✓
> loading google::oauth    ✓
> loading resend::email    ✓
> ready_for_user_input ▌`}
          </pre>
        </div>
        <div className="text-[10px] text-cyan-100/40 tracking-widest">// © 2026 CADASTRA::AI</div>
      </div>
      <div className="flex items-center justify-center p-12">
        <Bracketed className="w-full max-w-sm border border-cyan-400/20 bg-cyan-400/[0.02] p-7">
          <p className="text-[10px] tracking-[0.3em] text-cyan-400/70 mb-1">// AUTH::LOGIN</p>
          <h2 className="text-[18px] font-bold tracking-wider mb-7">SYSTEM ACCESS</h2>
          <button className="w-full h-10 border border-cyan-400/30 bg-cyan-400/[0.04] text-[11px] tracking-widest hover:bg-cyan-400/10 mb-3">
            ▶ CONTINUE WITH GOOGLE
          </button>
          <div className="flex items-center my-5">
            <div className="flex-1 h-px bg-cyan-400/15" />
            <span className="px-3 text-[10px] text-cyan-100/45 tracking-widest">// OR</span>
            <div className="flex-1 h-px bg-cyan-400/15" />
          </div>
          <label className="block text-[10px] tracking-widest text-cyan-400/70 mb-1.5">// EMAIL</label>
          <input className="w-full h-10 px-3 mb-4 bg-cyan-400/[0.04] border border-cyan-400/20 text-[12px] focus:outline-none focus:border-cyan-400/60" placeholder="user@domain" />
          <label className="block text-[10px] tracking-widest text-cyan-400/70 mb-1.5">// PASSWORD</label>
          <input type="password" className="w-full h-10 px-3 mb-6 bg-cyan-400/[0.04] border border-cyan-400/20 text-[12px] focus:outline-none focus:border-cyan-400/60" placeholder="••••••••" />
          <button className="w-full h-10 bg-cyan-400 hover:bg-cyan-300 text-[#050a10] text-[12px] font-bold tracking-widest">▶ EXECUTE LOGIN</button>
        </Bracketed>
      </div>
    </div>
  )
}

export function CockpitDashboard() {
  return (
    <div className="min-h-screen text-cyan-100 font-mono flex" style={bgStyle}>
      <Sidebar active="dashboard" />
      <div className="flex-1 min-w-0">
        <header className="border-b border-cyan-400/15 h-12 flex items-center px-6 text-[11px] gap-6">
          <span className="text-cyan-400/70 tracking-[0.3em]">// PANEL_01</span>
          <span className="text-cyan-100/70 tracking-widest">{m.empresa.toUpperCase()}</span>
          <span className="ml-auto px-2 h-5 border border-emerald-400/30 bg-emerald-400/10 text-emerald-300 text-[10px] tracking-widest flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" /> LIVE
          </span>
          <span className="text-cyan-100/55 tabular-nums tracking-widest">{new Date().toISOString().slice(0, 19).replace('T', ' ')}Z</span>
        </header>
        <main className="px-6 py-8 max-w-[1280px]">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-[10px] text-cyan-400/70 tracking-[0.3em]">// SECTION</p>
              <h1 className="text-[22px] font-bold tracking-tight">INDICADORES</h1>
            </div>
            <div className="flex gap-2">
              {['7D', '30D', '90D', '1Y'].map((p, i) => (
                <button key={p} className={`h-7 px-3 text-[11px] tracking-widest border ${i === 1 ? 'border-cyan-400/60 bg-cyan-400/10 text-cyan-200' : 'border-cyan-400/15 text-cyan-100/50'}`}>{p}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-3">
            {[
              { id: '01', label: 'LEADS', value: m.totalLeads, delta: '+12.3%' },
              { id: '02', label: 'CONSULTAS', value: m.consultas, delta: '+8.1%' },
              { id: '03', label: 'TRATAMENTOS', value: m.tratamentos, delta: '+22.4%' },
              { id: '04', label: 'RECEITA', value: brl(m.receita), delta: '+18.2%' },
            ].map((k) => (
              <Bracketed key={k.id} className="border border-cyan-400/20 bg-cyan-400/[0.02] p-4">
                <div className="flex items-center justify-between mb-3 text-[10px] tracking-[0.25em]">
                  <span className="text-cyan-400/70">{k.id} · {k.label}</span>
                  <span className="text-emerald-300">▲ {k.delta}</span>
                </div>
                <p className="text-[28px] font-semibold tabular-nums text-cyan-50 leading-none">{k.value}</p>
              </Bracketed>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="border border-cyan-400/20 bg-cyan-400/[0.02] p-5">
              <div className="text-[10px] tracking-[0.3em] text-cyan-400/70 mb-4">// CANAL · ORIGEM</div>
              <ul className="space-y-2.5">
                {m.origens.map((o) => (
                  <li key={o.nome} className="grid grid-cols-[120px_1fr_70px] items-center gap-3 text-[12px]">
                    <span className="text-cyan-100/80 tracking-widest uppercase">{o.nome}</span>
                    <div className="h-3 relative bg-cyan-400/[0.06] border border-cyan-400/15 overflow-hidden">
                      <div className="h-full bg-cyan-400/40" style={{ width: `${o.pct}%` }} />
                    </div>
                    <span className="text-right text-cyan-300 tabular-nums">{String(o.count).padStart(3, '0')}·{String(o.pct).padStart(2, '0')}%</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border border-amber-400/25 bg-amber-400/[0.02] p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] tracking-[0.3em] text-amber-300/80">// FINANCEIRO</span>
                <span className="text-[10px] text-amber-300 tracking-widest">{brl(m.receita)}</span>
              </div>
              <ul className="space-y-2.5">
                {m.formas.map((f) => (
                  <li key={f.forma} className="grid grid-cols-[100px_1fr_80px] items-center gap-3 text-[12px]">
                    <span className="text-amber-100/80 uppercase tracking-wider">{f.forma}</span>
                    <div className="h-3 bg-amber-400/[0.06] border border-amber-400/20 overflow-hidden">
                      <div className="h-full bg-amber-400/40" style={{ width: `${f.pct}%` }} />
                    </div>
                    <span className="text-right text-amber-200 tabular-nums">{brl(f.valor)}</span>
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

export function CockpitLead() {
  return (
    <div className="min-h-screen text-cyan-100 font-mono flex" style={bgStyle}>
      <Sidebar active="lead" />
      <div className="flex-1 min-w-0">
        <header className="border-b border-cyan-400/15 h-12 flex items-center px-6 text-[11px] gap-3">
          <span className="text-cyan-400/70 tracking-[0.3em]">// FORM_02</span>
          <span className="text-cyan-100/70 tracking-widest">CADASTRO::LEAD::NEW</span>
        </header>
        <main className="px-6 py-8 max-w-2xl">
          <p className="text-[10px] text-cyan-400/70 tracking-[0.3em] mb-1">// INPUT_BLOCK</p>
          <h1 className="text-[20px] font-bold tracking-tight mb-7">REGISTRAR LEAD</h1>
          <Bracketed className="border border-cyan-400/20 bg-cyan-400/[0.02] p-5 space-y-4">
            {[
              { label: 'NOME', placeholder: 'maria silva' },
              { label: 'TELEFONE', placeholder: '+55 11 99999 0000' },
              { label: 'ORIGEM', placeholder: 'instagram | indicacao | site' },
            ].map((f) => (
              <div key={f.label}>
                <label className="block text-[10px] tracking-widest text-cyan-400/70 mb-1.5">// {f.label}</label>
                <input className="w-full h-10 px-3 bg-cyan-400/[0.04] border border-cyan-400/20 text-[12px] focus:outline-none focus:border-cyan-400/60" placeholder={f.placeholder} />
              </div>
            ))}
            <div>
              <label className="block text-[10px] tracking-widest text-cyan-400/70 mb-2">// TIPO</label>
              <div className="grid grid-cols-2 gap-2">
                {['CADASTRO', 'RESGATE'].map((t, i) => (
                  <button key={t} className={`h-10 text-[11px] tracking-widest border ${i === 0 ? 'border-cyan-400/60 bg-cyan-400/10 text-cyan-200' : 'border-cyan-400/15 text-cyan-100/50'}`}>{t}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[{ k: 'INTERAGIU', v: 1 }, { k: 'AGENDOU', v: 1 }, { k: 'PAGO', v: 0 }].map((o) => (
                <button key={o.k} className={`h-9 text-[10px] tracking-widest border ${o.v ? 'border-cyan-400/60 bg-cyan-400/10 text-cyan-200' : 'border-cyan-400/15 text-cyan-100/50'}`}>
                  {o.k}: {o.v ? 'TRUE' : 'FALSE'}
                </button>
              ))}
            </div>
            <div>
              <label className="block text-[10px] tracking-widest text-cyan-400/70 mb-1.5">// RESPONSAVEL</label>
              <select className="w-full h-10 px-3 bg-cyan-400/[0.04] border border-cyan-400/20 text-[12px] tracking-wider">
                <option>RAYSSA</option>
                <option>MARIA EDUARDA</option>
                <option>ADRIELE</option>
              </select>
            </div>
            <div className="flex gap-2 pt-3 border-t border-cyan-400/15">
              <button className="h-10 px-4 border border-cyan-400/15 text-[10px] tracking-widest text-cyan-100/55">// CLEAR</button>
              <button className="h-10 px-5 ml-auto bg-cyan-400 hover:bg-cyan-300 text-[#050a10] text-[11px] font-bold tracking-widest">▶ EXECUTE</button>
            </div>
          </Bracketed>
        </main>
      </div>
    </div>
  )
}

export function CockpitEmpresa() {
  return (
    <div className="min-h-screen text-cyan-100 font-mono flex" style={bgStyle}>
      <Sidebar active="empresa" />
      <div className="flex-1 min-w-0">
        <header className="border-b border-cyan-400/15 h-12 flex items-center px-6 text-[11px] gap-3">
          <span className="text-cyan-400/70 tracking-[0.3em]">// PANEL_06</span>
          <span className="text-cyan-100/70 tracking-widest">EMPRESA::EQUIPE</span>
        </header>
        <main className="px-6 py-8 max-w-3xl space-y-3">
          <Bracketed className="border border-cyan-400/20 bg-cyan-400/[0.02] p-5">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 border border-cyan-400/40 bg-cyan-400/10 grid place-items-center">
                <span className="text-cyan-300 font-bold tracking-widest">IT</span>
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-cyan-400/70 tracking-[0.25em]">// EMPRESA</p>
                <h2 className="text-[18px] font-bold mt-0.5">{m.empresa.toUpperCase()}</h2>
                <p className="text-[11px] text-cyan-100/55 tracking-wider mt-1">CLINICA · MEMBROS::{m.members.length} · INVITES::PEND::2</p>
              </div>
              <span className="px-2 py-0.5 text-[10px] tracking-widest border border-cyan-400/40 bg-cyan-400/10 text-cyan-200">// OWNER</span>
            </div>
          </Bracketed>

          <Bracketed className="border border-cyan-400/20 bg-cyan-400/[0.02] p-5">
            <p className="text-[10px] text-cyan-400/70 tracking-[0.3em] mb-3">// INVITE::SEND</p>
            <div className="grid grid-cols-[1fr_140px_auto] gap-2">
              <input className="h-10 px-3 bg-cyan-400/[0.04] border border-cyan-400/20 text-[12px]" placeholder="user@domain" />
              <select className="h-10 px-3 bg-cyan-400/[0.04] border border-cyan-400/20 text-[12px] tracking-widest">
                <option>MEMBER</option>
                <option>ADMIN</option>
              </select>
              <button className="h-10 px-5 bg-cyan-400 text-[#050a10] text-[11px] font-bold tracking-widest">▶ SEND</button>
            </div>
          </Bracketed>

          <div className="border border-cyan-400/20 bg-cyan-400/[0.02]">
            <div className="px-5 h-10 flex items-center border-b border-cyan-400/15">
              <span className="text-[10px] text-cyan-400/70 tracking-[0.3em]">// MEMBERS_TABLE</span>
              <span className="ml-auto text-[10px] text-cyan-100/55 tabular-nums">N={m.members.length}</span>
            </div>
            <ul>
              {m.members.map((u, i) => (
                <li key={u.email} className={`flex items-center gap-3 px-5 h-12 ${i < m.members.length - 1 ? 'border-b border-cyan-400/10' : ''}`}>
                  <span className="text-[10px] text-cyan-400/70 tabular-nums w-6">{String(i + 1).padStart(2, '0')}</span>
                  <span className="h-7 w-7 border border-cyan-400/40 bg-cyan-400/10 grid place-items-center text-[10px] font-bold text-cyan-300">
                    {u.nome.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                  </span>
                  <span className="text-[12px] text-cyan-100 flex-1 tracking-wider">{u.nome.toUpperCase()}</span>
                  <span className="text-[11px] text-cyan-100/50">{u.email}</span>
                  <span className="text-[10px] tracking-widest px-2 py-0.5 border border-cyan-400/15 text-cyan-100/65">// {u.role.toUpperCase()}</span>
                </li>
              ))}
            </ul>
          </div>
        </main>
      </div>
    </div>
  )
}

export const cockpitVariant = {
  login: CockpitLogin,
  dashboard: CockpitDashboard,
  lead: CockpitLead,
  empresa: CockpitEmpresa,
} as const satisfies Record<PreviewSection, () => React.JSX.Element>
