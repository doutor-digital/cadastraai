'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Copy,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Webhook,
  Save,
  AlertCircle,
  TableProperties,
  Building2,
  Lock,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  cloudiaApi,
  buildCloudiaWebhookUrl,
  isBackendNotImplemented,
  type CloudiaConfigDto,
  type EmpresaDto,
} from '@/lib/api'
import {
  CLOUDIA_LEADS,
  CLOUDIA_CONSULTAS,
  CLOUDIA_TRATAMENTOS,
  CLOUDIA_ORIGENS,
  type SpreadsheetField,
} from '@/lib/cloudia-mapping'

interface Props {
  empresa: EmpresaDto
  onBack: () => void
}

type Tab = 'config' | 'mapping' | 'sync'

export function CloudiaView({ empresa, onBack }: Props) {
  const [tab, setTab] = useState<Tab>('config')
  const [cfg, setCfg] = useState<CloudiaConfigDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [backendMissing, setBackendMissing] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    cloudiaApi
      .getConfig(empresa.id)
      .then((res) => {
        if (!active) return
        setCfg(res)
      })
      .catch((err) => {
        if (!active) return
        if (isBackendNotImplemented(err)) setBackendMissing(true)
        else console.error('Falha ao carregar config Cloudia:', err)
      })
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [empresa.id])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para integrações
        </button>
      </div>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-cyan-500/10 p-2">
              <Webhook className="h-5 w-5 text-cyan-300" />
            </div>
            <h1 className="text-2xl font-semibold text-white">Cloudia</h1>
          </div>
          <p className="flex items-center gap-2 text-sm text-white/60">
            <Building2 className="h-4 w-4" />
            {empresa.nome}
          </p>
        </div>
      </header>

      {backendMissing && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/[0.05] p-4">
          <AlertCircle className="mt-0.5 h-4 w-4 text-amber-300" />
          <div className="space-y-1 text-sm">
            <p className="font-medium text-amber-200">Backend ainda não publicou os endpoints da Cloudia</p>
            <p className="text-xs text-amber-100/70">
              Esperado: <code className="rounded bg-black/30 px-1">/api/empresas/{`{id}`}/cloudia/config</code>{' '}
              e <code className="rounded bg-black/30 px-1">/cloudia/webhook</code>. A UI continua disponível para
              teste; salvar credenciais vai falhar até o deploy do backend.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-white/10 bg-white/[0.02] p-1">
        <TabBtn active={tab === 'config'} onClick={() => setTab('config')} label="Conexão" />
        <TabBtn active={tab === 'mapping'} onClick={() => setTab('mapping')} label="Mapeamento de campos" />
        <TabBtn active={tab === 'sync'} onClick={() => setTab('sync')} label="Sincronização" />
      </div>

      <div className="min-h-[300px]">
        {tab === 'config' && (
          <ConfigTab empresa={empresa} cfg={cfg} loading={loading} onSaved={setCfg} />
        )}
        {tab === 'mapping' && <MappingTab />}
        {tab === 'sync' && <SyncTab empresa={empresa} cfg={cfg} />}
      </div>
    </div>
  )
}

function TabBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-1 rounded-lg px-4 py-2 text-sm transition-colors',
        active ? 'bg-white/[0.08] text-white' : 'text-white/55 hover:text-white/85',
      )}
    >
      {label}
    </button>
  )
}

// ============================================================================
// Tab: Config
// ============================================================================

function ConfigTab({
  empresa,
  cfg,
  loading,
  onSaved,
}: {
  empresa: EmpresaDto
  cfg: CloudiaConfigDto | null
  loading: boolean
  onSaved: (cfg: CloudiaConfigDto) => void
}) {
  const [baseUrl, setBaseUrl] = useState(cfg?.baseUrl ?? 'https://human-metrics.cloudiabot.com')
  const [apiKey, setApiKey] = useState('')
  const [webhookSecret, setWebhookSecret] = useState(cfg?.webhookSecret ?? '')
  const [showKey, setShowKey] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (cfg?.baseUrl) setBaseUrl(cfg.baseUrl)
    if (cfg?.webhookSecret) setWebhookSecret(cfg.webhookSecret)
  }, [cfg])

  const webhookUrl = buildCloudiaWebhookUrl(empresa.id, webhookSecret || cfg?.webhookSecret)

  async function handleSave() {
    if (!apiKey.trim() && !cfg?.hasApiKey) {
      setTestResult({ ok: false, message: 'Informe a chave da API.' })
      return
    }
    setSaving(true)
    setTestResult(null)
    try {
      const saved = await cloudiaApi.saveConfig(empresa.id, {
        baseUrl: baseUrl.trim(),
        apiKey: apiKey.trim() || '__keep__',
        webhookSecret: webhookSecret.trim() || undefined,
      })
      onSaved(saved)
      setApiKey('')
      setTestResult({ ok: true, message: 'Configuração salva.' })
    } catch (err) {
      setTestResult({
        ok: false,
        message: err instanceof Error ? err.message : 'Erro ao salvar.',
      })
    } finally {
      setSaving(false)
    }
  }

  async function handleTest() {
    setTesting(true)
    setTestResult(null)
    try {
      const res = await cloudiaApi.testConnection(empresa.id)
      setTestResult({
        ok: res.ok,
        message: res.ok
          ? `Conectado${res.account?.name ? ` — ${res.account.name}` : ''}`
          : res.errorMessage ?? 'Falha na conexão',
      })
    } catch (err) {
      setTestResult({
        ok: false,
        message: err instanceof Error ? err.message : 'Erro no teste',
      })
    } finally {
      setTesting(false)
    }
  }

  if (loading) return <div className="text-sm text-white/40">Carregando…</div>

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Credenciais */}
      <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <div className="flex items-start gap-2">
          <Lock className="mt-0.5 h-4 w-4 text-cyan-300" />
          <div>
            <h3 className="font-semibold text-white">Credenciais da API Cloudia</h3>
            <p className="text-xs text-white/55">
              Guardadas criptografadas no backend, escopadas para esta empresa.
            </p>
          </div>
        </div>

        <Field label="Base URL">
          <input
            type="text"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://human-metrics.cloudiabot.com"
            className={inputCls}
          />
        </Field>

        <Field label="API Key">
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={
                cfg?.hasApiKey
                  ? `Chave atual termina em ${cfg.apiKeySuffix ?? '••••'} — deixe em branco p/ manter`
                  : 'Cole a chave da API Cloudia'
              }
              className={cn(inputCls, 'pr-10')}
            />
            <button
              type="button"
              onClick={() => setShowKey((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80"
              aria-label={showKey ? 'Ocultar' : 'Mostrar'}
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>

        <Field label="Webhook secret (opcional)">
          <input
            type="text"
            value={webhookSecret}
            onChange={(e) => setWebhookSecret(e.target.value)}
            placeholder="Validação do webhook recebido"
            className={inputCls}
          />
        </Field>

        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
          <button
            onClick={handleTest}
            disabled={testing || !cfg?.hasApiKey}
            className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2 text-sm text-white/85 hover:bg-white/[0.08] disabled:opacity-50"
          >
            <RefreshCw className={cn('h-4 w-4', testing && 'animate-spin')} />
            Testar conexão
          </button>
        </div>

        {testResult && (
          <div
            className={cn(
              'flex items-start gap-2 rounded-lg p-3 text-sm',
              testResult.ok
                ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                : 'border border-rose-500/30 bg-rose-500/10 text-rose-200',
            )}
          >
            {testResult.ok ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}
      </section>

      {/* Webhook URL */}
      <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <div className="flex items-start gap-2">
          <Webhook className="mt-0.5 h-4 w-4 text-cyan-300" />
          <div>
            <h3 className="font-semibold text-white">URL de webhook para a Cloudia</h3>
            <p className="text-xs text-white/55">
              Cole esta URL no painel da Cloudia para receber leads em tempo real.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <code className="block break-all rounded-lg border border-white/10 bg-black/40 p-3 text-xs text-cyan-200">
            {webhookUrl}
          </code>
          <button
            onClick={() => {
              navigator.clipboard.writeText(webhookUrl).then(() => {
                setCopied(true)
                setTimeout(() => setCopied(false), 1500)
              })
            }}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/80 hover:bg-white/[0.06]"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-300" /> : <Copy className="h-3 w-3" />}
            {copied ? 'Copiado' : 'Copiar URL'}
          </button>
        </div>

        <ul className="space-y-1.5 text-xs text-white/55">
          <li className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-cyan-400" />
            Cada empresa tem sua própria URL — não há vazamento entre clínicas.
          </li>
          <li className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-cyan-400" />
            Use o secret acima para validar a origem do webhook (header{' '}
            <code className="rounded bg-white/5 px-1">x-webhook-secret</code>).
          </li>
          <li className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-cyan-400" />
            Os campos esperados estão na aba <em>Mapeamento de campos</em>.
          </li>
        </ul>
      </section>
    </div>
  )
}

// ============================================================================
// Tab: Mapping
// ============================================================================

function MappingTab() {
  const sections: { id: string; title: string; rows: SpreadsheetField[] }[] = [
    { id: 'leads', title: 'Cadastro Geral (Leads)', rows: CLOUDIA_LEADS },
    { id: 'consultas', title: 'Consultas Comparecidas', rows: CLOUDIA_CONSULTAS },
    { id: 'tratamentos', title: 'Tratamentos Realizados', rows: CLOUDIA_TRATAMENTOS },
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <div className="flex items-start gap-2">
          <TableProperties className="mt-0.5 h-4 w-4 text-cyan-300" />
          <div className="space-y-1">
            <h3 className="font-semibold text-white">Mapeamento Cloudia → Cadastro</h3>
            <p className="text-xs text-white/55">
              Cada coluna da planilha vira um campo do cadastro. As secretárias só conferem o que
              já vem preenchido — elas conseguem editar os campos brancos que estiverem com a cor amarelo.
            </p>
          </div>
        </div>
      </div>

      {sections.map((s) => (
        <section
          key={s.id}
          className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.02] p-5"
        >
          <h4 className="font-semibold text-white">{s.title}</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-white/45">
                  <th className="px-2 py-2">Coluna Cloudia</th>
                  <th className="px-2 py-2">Campo no cadastro</th>
                  <th className="px-2 py-2">Entidade backend</th>
                  <th className="px-2 py-2">Observações</th>
                </tr>
              </thead>
              <tbody>
                {s.rows.map((row, idx) => (
                  <tr
                    key={`${s.id}-${idx}`}
                    className="border-b border-white/5 text-white/75 last:border-0"
                  >
                    <td className="px-2 py-2 font-medium text-white">{row.column}</td>
                    <td className="px-2 py-2">
                      {row.cadastroTarget ? (
                        <code className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-[11px] text-cyan-200">
                          {row.cadastroTarget}
                        </code>
                      ) : (
                        <span className="text-white/35">—</span>
                      )}
                    </td>
                    <td className="px-2 py-2">
                      {row.netEntity ? (
                        <span className="text-white/70">
                          {row.netEntity}
                          <span className="text-white/35">.</span>
                          {row.netField}
                        </span>
                      ) : (
                        <span className="text-white/35">derivado</span>
                      )}
                    </td>
                    <td className="px-2 py-2 text-white/50">{row.notes ?? ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      <section className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <h4 className="font-semibold text-white">Origens reconhecidas</h4>
        <p className="text-xs text-white/55">
          Lista canônica que o cadastro aceita. Origens iniciadas com "Resgate:" classificam o
          lead como <em>Resgate</em> automaticamente.
        </p>
        <div className="flex flex-wrap gap-1.5 pt-2">
          {CLOUDIA_ORIGENS.map((o) => (
            <span
              key={o}
              className={cn(
                'rounded-full border px-2.5 py-0.5 text-[11px]',
                o.startsWith('Resgate')
                  ? 'border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-200'
                  : 'border-white/10 bg-white/[0.04] text-white/70',
              )}
            >
              {o}
            </span>
          ))}
        </div>
      </section>
    </div>
  )
}

// ============================================================================
// Tab: Sync
// ============================================================================

function SyncTab({ empresa, cfg }: { empresa: EmpresaDto; cfg: CloudiaConfigDto | null }) {
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [since, setSince] = useState<string>(() => {
    const d = new Date()
    d.setDate(d.getDate() - 7)
    return d.toISOString().slice(0, 10)
  })

  async function handleSync() {
    setRunning(true)
    setResult(null)
    try {
      const res = await cloudiaApi.sync(empresa.id, {
        since: since ? new Date(since).toISOString() : undefined,
        limit: 500,
      })
      setResult({
        ok: true,
        message: `${res.received} recebidos · ${res.stored} novos · ${res.promoted} promovidos`,
      })
    } catch (err) {
      setResult({
        ok: false,
        message: err instanceof Error ? err.message : 'Falha ao sincronizar',
      })
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <h3 className="font-semibold text-white">Sincronização manual</h3>
        <p className="mt-1 text-sm text-white/55">
          Puxa as planilhas da Cloudia desde a data abaixo e cria os leads no inbox de revisão.
        </p>

        <div className="mt-4 flex flex-wrap items-end gap-3">
          <Field label="Buscar leads desde">
            <input
              type="date"
              value={since}
              onChange={(e) => setSince(e.target.value)}
              className={inputCls}
            />
          </Field>
          <button
            onClick={handleSync}
            disabled={running || !cfg?.hasApiKey}
            className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
          >
            <RefreshCw className={cn('h-4 w-4', running && 'animate-spin')} />
            {running ? 'Sincronizando…' : 'Sincronizar agora'}
          </button>
        </div>

        {!cfg?.hasApiKey && (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-amber-300">
            <AlertCircle className="h-3 w-3" />
            Configure a API key na aba Conexão antes de sincronizar.
          </p>
        )}

        {result && (
          <div
            className={cn(
              'mt-3 flex items-start gap-2 rounded-lg p-3 text-sm',
              result.ok
                ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                : 'border border-rose-500/30 bg-rose-500/10 text-rose-200',
            )}
          >
            {result.ok ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <span>{result.message}</span>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/[0.05] to-cyan-500/[0.05] p-5">
        <h3 className="font-semibold text-white">Auto-sync agendado</h3>
        <p className="mt-1 text-sm text-white/65">
          Agende a sincronização recorrente (a cada 15min, 1h, 6h ou diária) no painel{' '}
          <em>Painel unificado → Auto-sync</em>. Cada empresa controla a frequência separadamente.
        </p>
      </section>
    </div>
  )
}

// ============================================================================
// Atoms
// ============================================================================

const inputCls =
  'w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-cyan-400/50'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-white/65">{label}</span>
      {children}
    </label>
  )
}
