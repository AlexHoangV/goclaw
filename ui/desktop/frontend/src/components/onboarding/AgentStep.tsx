import { useEffect, useState } from 'react'
import { getApiClient } from '../../lib/api'
import type { StepProps } from './WelcomeStep'

interface Template {
  name: string
  systemPrompt: string
}

const TEMPLATES: Template[] = [
  {
    name: 'General Assistant',
    systemPrompt: 'You are a helpful, concise assistant. Answer questions clearly and accurately.',
  },
  {
    name: 'Code Helper',
    systemPrompt: 'You are an expert software engineer. Help with coding, debugging, and code reviews. Provide working code examples.',
  },
  {
    name: 'Research Bot',
    systemPrompt: 'You are a research assistant. Analyze topics thoroughly, cite sources when possible, and summarize findings clearly.',
  },
]

interface AgentStepProps extends StepProps {
  providerId: string | null
  onAgentCreated: (agentName: string) => void
}

export function AgentStep({ onNext, onBack, providerId, onAgentCreated }: AgentStepProps) {
  const [name, setName] = useState('')
  const [model, setModel] = useState('')
  const [systemPrompt, setSystemPrompt] = useState('')
  const [models, setModels] = useState<string[]>([])
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!providerId) return
    getApiClient()
      .get<{ models: { id: string }[] }>(`/v1/providers/${providerId}/models`)
      .then((res) => {
        const ids = res.models.map((m) => m.id)
        setModels(ids)
        if (ids.length > 0) setModel(ids[0])
      })
      .catch(() => {
        // fallback — user can type a model manually
      })
  }, [providerId])

  const applyTemplate = (t: Template) => {
    setName(t.name)
    setSystemPrompt(t.systemPrompt)
  }

  const handleCreate = async () => {
    if (!name.trim() || !model.trim()) return
    setCreating(true)
    setError('')
    try {
      await getApiClient().post('/v1/agents', {
        name: name.trim(),
        model: model.trim(),
        system_prompt: systemPrompt.trim() || undefined,
        provider_id: providerId,
      })
      onAgentCreated(name.trim())
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
            key={t.name}
            onClick={() => applyTemplate(t)}
            className={[
              'p-3 rounded-xl border text-left transition-all',
              name === t.name ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/50',
            ].join(' ')}
          >
            <p className="font-medium text-text-primary text-xs">{t.name}</p>
          </button>
        ))}
      </div>

      {/* Name */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-text-secondary mb-1.5">Agent Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Assistant"
          className="w-full bg-surface-tertiary border border-border rounded-lg px-3 py-2.5 text-base md:text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      {/* Model */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-text-secondary mb-1.5">Model</label>
        {models.length > 0 ? (
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full bg-surface-tertiary border border-border rounded-lg px-3 py-2.5 text-base md:text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
          >
            {models.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="e.g. claude-sonnet-4-5"
            className="w-full bg-surface-tertiary border border-border rounded-lg px-3 py-2.5 text-base md:text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
          />
        )}
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
        <div className="mb-4 text-sm px-3 py-2 rounded-lg bg-error/10 text-error">
          {error}
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
        <button
          onClick={handleCreate}
          disabled={!name.trim() || !model.trim() || creating}
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
