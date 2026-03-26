import { useEffect, useState } from 'react'
import { getApiClient } from '../../lib/api'
import type { StepProps } from './WelcomeStep'

interface Template {
  name: string
  key: string
  systemPrompt: string
}

const TEMPLATES: Template[] = [
  {
    name: 'General Assistant',
    key: 'assistant',
    systemPrompt: 'You are a helpful, concise assistant. Answer questions clearly and accurately.',
  },
  {
    name: 'Code Helper',
    key: 'code-helper',
    systemPrompt: 'You are an expert software engineer. Help with coding, debugging, and code reviews. Provide working code examples.',
  },
  {
    name: 'Research Bot',
    key: 'research-bot',
    systemPrompt: 'You are a research assistant. Analyze topics thoroughly, cite sources when possible, and summarize findings clearly.',
  },
]

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

interface AgentStepProps extends StepProps {
  providerId: string | null
  selectedModel?: string
  onAgentCreated: (agentName: string) => void
}

export function AgentStep({ onNext, onBack, providerId, selectedModel, onAgentCreated }: AgentStepProps) {
  const [displayName, setDisplayName] = useState('')
  const [agentKey, setAgentKey] = useState('')
  const [keyEdited, setKeyEdited] = useState(false)
  const [model] = useState(selectedModel || '')
  const [systemPrompt, setSystemPrompt] = useState('')
  const [providerName, setProviderName] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  // Fetch provider name
  useEffect(() => {
    if (!providerId) return
    getApiClient()
      .get<{ name: string }>(`/v1/providers/${providerId}`)
      .then((p) => setProviderName(p.name))
      .catch(() => {})
  }, [providerId])

  const applyTemplate = (t: Template) => {
    setDisplayName(t.name)
    setAgentKey(t.key)
    setKeyEdited(true)
    setSystemPrompt(t.systemPrompt)
  }

  const handleNameChange = (val: string) => {
    setDisplayName(val)
    if (!keyEdited) setAgentKey(slugify(val))
  }

  const handleCreate = async () => {
    const key = agentKey.trim() || slugify(displayName)
    if (!key || !model.trim()) return
    setCreating(true)
    setError('')
    try {
      const description = systemPrompt.trim() || `You are ${displayName.trim() || key}, a helpful AI assistant.`
      const payload: Record<string, unknown> = {
        agent_key: key,
        display_name: displayName.trim() || undefined,
        provider: providerName,
        model: model.trim(),
        agent_type: 'predefined',
        other_config: { description },
      }
      await getApiClient().post('/v1/agents', payload)
      onAgentCreated(displayName.trim() || key)
      onNext()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create agent')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-text-primary mb-2">Create Your First Agent</h2>
      <p className="text-text-secondary mb-5">Pick a template or configure from scratch.</p>

      {/* Template cards */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {TEMPLATES.map((t) => (
          <button
            key={t.key}
            onClick={() => applyTemplate(t)}
            className={[
              'p-3 rounded-xl border text-left transition-all',
              agentKey === t.key ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/50',
            ].join(' ')}
          >
            <p className="font-medium text-text-primary text-xs">{t.name}</p>
          </button>
        ))}
      </div>

      {/* Display Name */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-text-secondary mb-1.5">Display Name</label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="My Assistant"
          className="w-full bg-surface-tertiary border border-border rounded-lg px-3 py-2.5 text-base md:text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      {/* Agent Key (slug) */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          Agent Key <span className="text-text-muted font-normal">(slug)</span>
        </label>
        <input
          type="text"
          value={agentKey}
          onChange={(e) => { setAgentKey(slugify(e.target.value)); setKeyEdited(true) }}
          placeholder="my-assistant"
          className="w-full bg-surface-tertiary border border-border rounded-lg px-3 py-2.5 text-base md:text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent font-mono"
        />
      </div>

      {/* Model (selected in previous step) */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-text-secondary mb-1.5">Model</label>
        <div className="w-full bg-surface-tertiary border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary font-mono">
          {model || 'Not selected'}
        </div>
      </div>

      {/* System prompt */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          System Prompt <span className="text-text-muted font-normal">(optional)</span>
        </label>
        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          rows={3}
          placeholder="You are a helpful assistant..."
          className="w-full bg-surface-tertiary border border-border rounded-lg px-3 py-2.5 text-base md:text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent resize-none"
        />
      </div>

      {error && (
        <div className="mb-4 text-sm px-3 py-2 rounded-lg bg-error/10 text-error">{error}</div>
      )}

      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-secondary transition-colors">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Back
        </button>
        <button
          onClick={handleCreate}
          disabled={(!agentKey.trim() && !displayName.trim()) || !model.trim() || creating}
          className="px-6 py-2.5 bg-accent text-white rounded-lg font-medium hover:bg-accent-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {creating && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          Create Agent
        </button>
      </div>
    </div>
  )
}

export type { AgentStepProps }
