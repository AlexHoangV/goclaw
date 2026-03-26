import { useState, useEffect, useMemo } from 'react'
import { Combobox } from '../../common/Combobox'
import { PROVIDER_TYPES, slugify } from '../../../constants/providers'
import type { ProviderData, ProviderInput } from '../../../types/provider'

interface ProviderFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** If set, editing this provider. Otherwise creating. */
  provider?: ProviderData | null
  onSubmit: (input: ProviderInput) => Promise<void>
  onVerify?: (input: { provider_type: string; api_base?: string; api_key?: string }) => Promise<{ success: boolean; error?: string }>
}

export function ProviderFormDialog({ open, onOpenChange, provider, onSubmit, onVerify }: ProviderFormDialogProps) {
  const isEditing = !!provider

  const [providerType, setProviderType] = useState(provider?.provider_type ?? '')
  const [displayName, setDisplayName] = useState(provider?.display_name ?? '')
  const [apiBase, setApiBase] = useState(provider?.api_base ?? '')
  const [apiKey, setApiKey] = useState('')
  const [enabled, setEnabled] = useState(provider?.enabled ?? true)
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [verifyResult, setVerifyResult] = useState<{ success: boolean; error?: string } | null>(null)
  const [error, setError] = useState('')

  // Reset form when dialog opens/closes or provider changes
  useEffect(() => {
    if (open) {
      setProviderType(provider?.provider_type ?? '')
      setDisplayName(provider?.display_name ?? '')
      setApiBase(provider?.api_base ?? '')
      setApiKey('')
      setEnabled(provider?.enabled ?? true)
      setError('')
      setVerifyResult(null)
    }
  }, [open, provider])

  // Auto-set api_base from provider type
  const typeInfo = useMemo(() => PROVIDER_TYPES.find((t) => t.value === providerType), [providerType])
  useEffect(() => {
    if (!isEditing && typeInfo?.apiBase && !apiBase) {
      setApiBase(typeInfo.apiBase)
    }
  }, [typeInfo, isEditing, apiBase])

  const name = useMemo(() => {
    if (isEditing) return provider!.name
    return slugify(displayName || providerType) || 'provider'
  }, [isEditing, provider, displayName, providerType])

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const input: ProviderInput = {
        name,
        display_name: displayName || undefined,
        provider_type: providerType,
        api_base: apiBase || undefined,
        enabled,
      }
      // Only send api_key if user entered a new one
      if (apiKey) input.api_key = apiKey
      await onSubmit(input)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save provider')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    if (!onVerify) return
    setVerifying(true)
    setVerifyResult(null)
    try {
      const res = await onVerify({
        provider_type: providerType,
        api_base: apiBase || undefined,
        api_key: apiKey || provider?.api_key || undefined,
      })
      setVerifyResult(res)
    } catch (err) {
      setVerifyResult({ success: false, error: err instanceof Error ? err.message : 'Verify failed' })
    } finally {
      setVerifying(false)
    }
  }

  if (!open) return null

  const typeOptions = PROVIDER_TYPES.map((t) => ({ value: t.value, label: t.label }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-surface-secondary border border-border rounded-xl shadow-xl max-w-md w-full mx-4 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-text-primary">
          {isEditing ? 'Edit Provider' : 'Add Provider'}
        </h3>

        {/* Provider type */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-text-secondary">Provider Type</label>
          <Combobox
            value={providerType}
            onChange={setProviderType}
            options={typeOptions}
            placeholder="Select provider..."
            disabled={isEditing}
          />
        </div>

        {/* Display name */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-text-secondary">Display Name</label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder={typeInfo?.label ?? 'My Provider'}
            className="w-full bg-surface-tertiary border border-border rounded-lg px-3 py-2 text-base md:text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* API Base */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-text-secondary">API Base URL</label>
          <input
            value={apiBase}
            onChange={(e) => setApiBase(e.target.value)}
            placeholder="https://api.example.com"
            className="w-full bg-surface-tertiary border border-border rounded-lg px-3 py-2 text-base md:text-sm text-text-primary font-mono placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* API Key */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-text-secondary">
            API Key {isEditing && <span className="text-text-muted font-normal">(leave blank to keep current)</span>}
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={isEditing ? '••••••••' : 'sk-...'}
            className="w-full bg-surface-tertiary border border-border rounded-lg px-3 py-2 text-base md:text-sm text-text-primary font-mono placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Enabled toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="rounded border-border accent-accent"
          />
          <span className="text-xs text-text-secondary">Enabled</span>
        </label>

        {/* Verify button + result */}
        {onVerify && providerType && (
          <div className="space-y-1">
            <button
              onClick={handleVerify}
              disabled={verifying || !providerType}
              className="text-xs text-accent hover:underline disabled:opacity-50"
            >
              {verifying ? 'Verifying...' : 'Test Connection'}
            </button>
            {verifyResult && (
              <p className={`text-xs ${verifyResult.success ? 'text-success' : 'text-error'}`}>
                {verifyResult.success ? 'Connection successful' : verifyResult.error}
              </p>
            )}
          </div>
        )}

        {error && <p className="text-xs text-error">{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={() => onOpenChange(false)}
            className="px-3 py-1.5 text-xs border border-border rounded-lg text-text-secondary hover:bg-surface-tertiary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !providerType}
            className="px-4 py-1.5 text-xs bg-accent text-white rounded-lg font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {loading ? '...' : isEditing ? 'Save' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  )
}
