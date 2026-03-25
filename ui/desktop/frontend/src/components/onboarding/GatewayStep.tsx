import { useEffect, useState } from 'react'
import { wails } from '../../lib/wails'
import type { StepProps } from './WelcomeStep'

export function GatewayStep({ onNext, onBack }: StepProps) {
  const [ready, setReady] = useState(false)
  const [port, setPort] = useState<number | null>(null)
  const [attempts, setAttempts] = useState(0)

  useEffect(() => {
    let cancelled = false

    const poll = async () => {
      let tries = 0
      while (!cancelled && tries < 20) {
        try {
          const isReady = await wails.isGatewayReady()
          if (isReady) {
            const p = await wails.getGatewayPort()
            if (!cancelled) {
              setPort(p)
              setReady(true)
            }
            return
          }
        } catch {
          // not ready yet
        }
        await new Promise((r) => setTimeout(r, 500))
        tries++
        if (!cancelled) setAttempts(tries)
      }
    }

    poll()
    return () => { cancelled = true }
  }, [])

  return (
    <div>
      <h2 className="text-2xl font-bold text-text-primary mb-2">Gateway Status</h2>
      <p className="text-text-secondary mb-8">
        GoClaw starts a local gateway to run your AI agents.
      </p>

      <div className="bg-surface-secondary border border-border rounded-xl p-6 mb-8">
        {ready ? (
          <div className="flex items-center gap-4">
            {/* Green check */}
            <div className="w-10 h-10 rounded-full bg-success/15 flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-success">
                <path d="M4 10L8 14L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-text-primary">Gateway is running</p>
              {port && (
                <p className="text-sm text-text-muted font-mono mt-0.5">
                  localhost:{port}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            {/* Spinner */}
            <div className="w-10 h-10 rounded-full bg-surface-tertiary flex items-center justify-center flex-shrink-0">
              <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
            <div>
              <p className="font-medium text-text-primary">Starting gateway…</p>
              <p className="text-sm text-text-muted mt-0.5">
                {attempts > 0 ? `Attempt ${attempts}/20` : 'Initializing'}
              </p>
            </div>
          </div>
        )}
      </div>

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
          onClick={onNext}
          disabled={!ready}
          className="px-6 py-2.5 bg-accent text-white rounded-lg font-medium hover:bg-accent-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  )
}
