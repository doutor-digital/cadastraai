'use client'

import { useState } from 'react'
import { linearVariant } from './variant-linear'
import { stripeVariant } from './variant-stripe'
import { cockpitVariant } from './variant-cockpit'
import { glassVariant } from './variant-glass'
import { bentoVariant } from './variant-bento'
import { sections, type PreviewSection } from './mock-data'

type VariantId = 'linear' | 'stripe' | 'cockpit' | 'glass' | 'bento'

const variants: { id: VariantId; name: string; tagline: string; surfaces: typeof linearVariant }[] = [
  { id: 'linear',  name: 'V1 — Linear',   tagline: 'Editorial dark · denso · sem ruído',           surfaces: linearVariant },
  { id: 'stripe',  name: 'V2 — Stripe',   tagline: 'Premium SaaS · gradiente sutil · sparklines',  surfaces: stripeVariant },
  { id: 'cockpit', name: 'V3 — Cockpit',  tagline: 'Mono · grid · cyan + amber · HUD técnico',     surfaces: cockpitVariant },
  { id: 'glass',   name: 'V4 — Glass',    tagline: 'Mesh gradient · vidro real · tipografia leve', surfaces: glassVariant },
  { id: 'bento',   name: 'V5 — Bento',    tagline: 'Grid assimétrico · números gigantes · destaques', surfaces: bentoVariant },
]

export function PreviewShell() {
  const [variant, setVariant] = useState<VariantId>('linear')
  const [section, setSection] = useState<PreviewSection>('dashboard')

  const current = variants.find((v) => v.id === variant)!
  const SurfaceComponent = current.surfaces[section]

  return (
    <div className="relative min-h-screen">
      {/* Floating control bar */}
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 max-w-[96vw]">
        <div className="rounded-2xl border border-white/12 bg-black/85 backdrop-blur-xl shadow-[0_24px_48px_-22px_rgba(0,0,0,0.7)] p-2">
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <div className="flex items-center gap-0.5 rounded-xl bg-white/[0.03] p-0.5">
              {variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVariant(v.id)}
                  className={`h-8 px-3 rounded-lg text-[12px] font-medium transition-colors ${
                    variant === v.id
                      ? 'bg-white text-black'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {v.name}
                </button>
              ))}
            </div>
            <span className="hidden md:block h-6 w-px bg-white/15 mx-1" />
            <div className="flex items-center gap-0.5 rounded-xl bg-white/[0.03] p-0.5">
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSection(s.id)}
                  className={`h-8 px-3 rounded-lg text-[12px] font-medium transition-colors ${
                    section === s.id
                      ? 'bg-cyan-300 text-black'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <p className="text-center text-[11px] text-white/55 mt-2 px-2">
            <span className="text-white/85 font-semibold">{current.name}</span> · {current.tagline}
          </p>
        </div>
      </div>

      {/* Active surface */}
      <SurfaceComponent />
    </div>
  )
}
