'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Building2, ArrowRight } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { empresasApi } from '@/lib/api'
import { cn } from '@/lib/utils'

export function CreateEmpresaForm() {
  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [bootstrapping, setBootstrapping] = useState(true)

  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/login')
      return
    }

    let cancelled = false
    empresasApi
      .list()
      .then((empresas) => {
        if (cancelled) return
        if (empresas.length > 0) {
          router.push('/dashboard')
        } else {
          setBootstrapping(false)
        }
      })
      .catch(() => {
        if (!cancelled) setBootstrapping(false)
      })
    return () => {
      cancelled = true
    }
  }, [authLoading, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      await empresasApi.create({
        nome: nome.trim(),
        tipo: tipo.trim() || undefined,
      })
      router.push('/dashboard?view=empresa')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar empresa')
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading || bootstrapping) {
    return (
      <div className="min-h-screen grid place-items-center bg-linear-to-br from-[#091420] via-[#0d2236] to-[#0a3450]">
        <Loader2 className="h-6 w-6 animate-spin text-cyan-300" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#091420] via-[#0d2236] to-[#0a3450] p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div
            className="mx-auto mb-4 h-12 w-12 grid place-items-center rounded-xl"
            style={{
              background: 'linear-gradient(135deg, #22d3ee, #38bdf8)',
              boxShadow: '0 0 30px rgba(34,211,238,0.45)',
            }}
          >
            <Building2 className="h-6 w-6 text-[#081420]" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-bold text-slate-50 mb-2 tracking-tight">
            Cadastrar empresa
          </h1>
          <p className="text-cyan-100/60 text-sm">
            Esse é seu próximo passo, {user?.name?.split(' ')[0] ?? 'usuário'}. Vamos vincular sua conta a uma empresa.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-7 border border-cyan-400/15 bg-[#0d1c2a]/85 backdrop-blur-xl shadow-[0_28px_60px_-30px_rgba(0,0,0,0.6)] space-y-5"
        >
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-400/30 text-rose-200 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="nome" className="block text-[11px] font-semibold tracking-[0.18em] uppercase text-cyan-100/60 mb-2">
              Nome da empresa
            </label>
            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Instituto Trauma"
              required
              minLength={2}
              className="w-full px-4 py-3 rounded-lg bg-[#0b1e2c]/70 border border-cyan-400/15 text-slate-100 placeholder:text-cyan-100/30 focus:outline-none focus:border-cyan-400/55 focus:ring-2 focus:ring-cyan-400/20 transition-all"
            />
          </div>

          <div>
            <label htmlFor="tipo" className="block text-[11px] font-semibold tracking-[0.18em] uppercase text-cyan-100/60 mb-2">
              Tipo (opcional)
            </label>
            <input
              id="tipo"
              type="text"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              placeholder="Clínica, Consultório, Instituto…"
              className="w-full px-4 py-3 rounded-lg bg-[#0b1e2c]/70 border border-cyan-400/15 text-slate-100 placeholder:text-cyan-100/30 focus:outline-none focus:border-cyan-400/55 focus:ring-2 focus:ring-cyan-400/20 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              'w-full py-3 rounded-lg font-semibold transition-all',
              'bg-gradient-to-r from-cyan-400 to-sky-500 text-[#081420]',
              'hover:from-cyan-300 hover:to-sky-400 shadow-[0_0_30px_-8px_rgba(34,211,238,0.6)]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'flex items-center justify-center gap-2',
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Criando empresa…
              </>
            ) : (
              <>
                Cadastrar empresa
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
