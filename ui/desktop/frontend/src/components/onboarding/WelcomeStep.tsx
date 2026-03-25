interface StepProps {
  onNext: () => void
  onSkip?: () => void
  onBack?: () => void
}

export function WelcomeStep({ onNext, onSkip }: StepProps) {
  return (
    <div className="text-center">
      {/* Logo/Icon */}
      <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-accent">
          <path d="M16 4L28 10V22L16 28L4 22V10L16 4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="M16 4V16M28 10L16 16M4 10L16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      <h1 className="text-3xl font-bold text-text-primary mb-3">Welcome to GoClaw</h1>
      <p className="text-text-secondary mb-8 max-w-sm mx-auto">
        Your local AI agent gateway. Set up in under 2 minutes.
      </p>

      <button
        onClick={onNext}
        className="px-8 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent-hover transition-colors"
      >
        Get Started
      </button>

      {onSkip && (
        <p className="mt-6">
          <button
            onClick={onSkip}
            className="text-sm text-text-muted hover:text-text-secondary transition-colors"
          >
            Skip to dashboard →
          </button>
        </p>
      )}
    </div>
  )
}

export type { StepProps }
