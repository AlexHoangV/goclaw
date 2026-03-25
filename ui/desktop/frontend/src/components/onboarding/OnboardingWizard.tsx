import { useState } from 'react'
import { WelcomeStep } from './WelcomeStep'
import { GatewayStep } from './GatewayStep'
import { ProviderStep } from './ProviderStep'
import { AgentStep } from './AgentStep'
import { ReadyStep } from './ReadyStep'

interface OnboardingWizardProps {
  onComplete: () => void
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(1)
  const [providerId, setProviderId] = useState<string | null>(null)
  const [agentName, setAgentName] = useState('')
  const totalSteps = 5

  return (
    <div className="h-dvh flex flex-col bg-surface-primary">
      {/* Progress bar */}
      <div className="h-1 bg-surface-tertiary flex-shrink-0">
        <div
          className="h-full bg-accent transition-all duration-300"
          style={{ width: `${(step / totalSteps) * 100}%` }}
        />
      </div>

      {/* Step counter */}
      <div className="flex justify-end px-8 pt-4 flex-shrink-0">
        <span className="text-xs text-text-muted">
          {step} / {totalSteps}
        </span>
      </div>

      {/* Step content */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-lg">
          {step === 1 && (
            <WelcomeStep
              onNext={() => setStep(2)}
              onSkip={onComplete}
            />
          )}
          {step === 2 && (
            <GatewayStep
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <ProviderStep
              onNext={() => setStep(4)}
              onBack={() => setStep(2)}
              onProviderSaved={setProviderId}
            />
          )}
          {step === 4 && (
            <AgentStep
              onNext={() => setStep(5)}
              onBack={() => setStep(3)}
              providerId={providerId}
              onAgentCreated={setAgentName}
            />
          )}
          {step === 5 && (
            <ReadyStep
              onNext={onComplete}
              onBack={() => setStep(4)}
              agentName={agentName}
            />
          )}
        </div>
      </div>
    </div>
  )
}
