import { useState } from 'react'
import { getApiClient } from '../../lib/api'
import type { StepProps } from './WelcomeStep'

type ProviderType = 'anthropic' | 'openai' | 'ollama'

interface ProviderCard {
  id: ProviderType
  label: string
  description: string
  needsKey: boolean
  defaultModel: string
  providerType: string
}

const PROVIDERS: ProviderCard[] = [
  { id: 'anthropic', label: 'Anthropic', description: 'Claude models', needsKey: true, defaultModel: 'claude-sonnet-4-5', providerType: 'anthropic' },
  { id: 'openai', label: 'OpenAI', description: 'GPT-4 and o-series', needsKey: true, defaultModel: 'gpt-4o', providerType: 'openai' },
  { id: 'ollama', label: 'Ollama', description: 'Local models, no key needed', needsKey: false, defaultModel: 'llama3.2', providerType: 'openai_compat' },
]

interface ProviderStepProps extends StepProps {
  onProviderSaved: (providerId: string) => void
}

export function ProviderStep({ onNext, onBack, onProviderSaved }: ProviderStepProps) {
  const [selected, setSelected] = useState<ProviderType>('anthropic')
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [status, setStatus] = useState<'idle' | 'testing' | 'ok' | 'error'>('idle')
  const [statusMsg, setStatusMsg] = useState('')
  const [_savedProviderId, setSavedProviderId] = useState<string | null>(null)

  const provider = PROVIDERS.find((p) => p.id === selected)!
  const canTest = !provider.needsKey || apiKey.trim().length > 0

  const handleTest = async () => {
    setStatus('testing')
    setStatusMsg('')
    const start = Date.now()
    try {
      const api = getApiClient()
      // Create provider first, then verify
      const slug = `onboarding-${selected}-${Date.now()}`
      const payload: Record<string, unknown> = {
        name: slug,
        provider_type: provider.providerType,
        enabled: true,
      }
      if (provider.needsKey) payload.api_key = apiKey.trim()
      if (selected === 'ollama') payload.api_base = 'http://localhost:11434/v1'

      const created = await api.post<{ id: string }>('/v1/providers', payload)
      setSavedProviderId(created.id)

      // Verify with default model
      const result = await api.post<{ valid: boolean; error?: string }>(
        `/v1/providers/${created.id}/verify`,
        { model: provider.defaultModel }
      )
      const elapsed = Date.now() - start
      if (result.valid) {
        setStatus('ok')
        setStatusMsg(`Connected in ${elapsed}ms`)
        onProviderSaved(created.id)
      } else {
        setStatus('error')
        setStatusMsg(result.error ?? 'Connection failed')
      }
    } catch (err) {
      setStatus('error')
      setStatusMsg(err instanceof Error ? err.message : 'Connection failed')
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-text-primary mb-2">Choose a Provider</h2>
      <p className="text-text-secondary mb-6">Select an AI provider to power your agents.</p>

      {/* Provider cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {PROVIDERS.map((p) => (
          <button
            key={p.id}
            onClick={() => { setSelected(p.id); setStatus('idle'); setStatusMsg(''); setSavedProviderId(null) }}
            className={[
              'p-4 rounded-xl border text-left transition-all',
              selected === p.id
                ? 'border-accent bg-accent/10'
                : 'border-border hover:border-accent/50',
            ].join(' ')}
          >
            <p className="font-medium text-text-primary text-sm">{p.label}</p>
            <p className="text-xs text-text-muted mt-1">{p.description}</p>
          </button>
        ))}
      </div>

      {/* API key input */}
      {provider.needsKey && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-text-secondary mb-1.5">API Key</label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => { setApiKey(e.target.value); setStatus('idle'); setStatusMsg('') }}
              placeholder={`Paste your ${provider.label} API key`}
              className="w-full bg-surface-tertiary border border-border rounded-lg px-3 py-2.5 pr-10 text-base md:text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              type="button"
              onClick={() => setShowKey((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
            >
              {showKey ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5Z" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M2 2l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5Z" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Status message */}
      {statusMsg && (
        <div className={['mb-4 text-sm px-3 py-2 rounded-lg', status === 'ok' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'].join(' ')}>
          {status === 'ok' ? '✓ ' : '✗ '}{statusMsg}
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-secondary transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={handleTest}
            disabled={!canTest || status === 'testing'}
            className="px-4 py-2.5 border border-border rounded-lg text-sm font-medium text-text-secondary hover:border-accent hover:text-text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {status === 'testing' && <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />}
            Test Connection
          </button>
          <button
            onClick={onNext}
            disabled={status !== 'ok'}
            className="px-6 py-2.5 bg-accent text-white rounded-lg font-medium hover:bg-accent-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

export type { ProviderStepProps }
