import type { StepProps } from './WelcomeStep'

interface ReadyStepProps extends StepProps {
  agentName: string
}

export function ReadyStep({ onBack, onNext: onComplete, agentName }: ReadyStepProps) {
  return (
    <div className="text-center">
      {/* Success icon */}
      <div className="w-16 h-16 bg-success/15 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-success">
          <path
            d="M6 16L12 22L26 8"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h2 className="text-3xl font-bold text-text-primary mb-3">You're all set!</h2>
      <p className="text-text-secondary mb-2">
        Your agent <span className="font-semibold text-text-primary">{agentName}</span> is ready to use.
      </p>
      <p className="text-text-muted text-sm mb-8">Start chatting or add more agents from the dashboard.</p>

      <button
        onClick={onComplete}
        className="px-8 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent-hover transition-colors"
      >
        Start Chatting
      </button>

      <p className="mt-6">
        <button
          onClick={onBack}
          className="text-sm text-text-muted hover:text-text-secondary transition-colors"
        >
          ← Back
        </button>
      </p>
    </div>
  )
}

export type { ReadyStepProps }
