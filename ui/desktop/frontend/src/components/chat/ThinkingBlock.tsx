import { useState } from 'react'

interface ThinkingBlockProps {
  text: string
}

export function ThinkingBlock({ text }: ThinkingBlockProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="mb-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors"
      >
        <svg
          className={`w-3 h-3 transition-transform ${expanded ? 'rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span>Thinking</span>
        <span className="text-text-muted">({text.length} chars)</span>
      </button>

      {expanded && (
        <div className="mt-2 pl-4 border-l-2 border-surface-tertiary">
          <p className="text-xs text-text-muted whitespace-pre-wrap leading-relaxed font-mono">
            {text}
          </p>
        </div>
      )}
    </div>
  )
}
