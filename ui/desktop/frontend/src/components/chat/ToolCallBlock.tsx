import { useState } from 'react'
import type { ToolCall } from '../../stores/chat-store'

interface ToolCallBlockProps {
  toolCall: ToolCall
}

export function ToolCallBlock({ toolCall }: ToolCallBlockProps) {
  const [expanded, setExpanded] = useState(false)

  const statusColor = {
    calling: 'text-warning',
    completed: 'text-success',
    error: 'text-error',
  }[toolCall.state]

  return (
    <div className="mb-2 rounded-lg border border-border overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-surface-secondary hover:bg-surface-tertiary transition-colors text-left"
      >
        <svg className="w-3.5 h-3.5 text-text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>

        <span className="text-xs font-mono text-text-primary flex-1 truncate">
          {toolCall.toolName}
        </span>

        <span className={`text-xs ${statusColor}`}>
          {toolCall.state === 'calling' ? (
            <span className="inline-block w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
          ) : toolCall.state === 'completed' ? '✓' : '✕'}
        </span>

        <svg
          className={`w-3 h-3 text-text-muted transition-transform ${expanded ? 'rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {expanded && (
        <div className="px-3 py-2 border-t border-border bg-surface-primary">
          {Object.keys(toolCall.arguments).length > 0 && (
            <div className="mb-2">
              <p className="text-[10px] text-text-muted mb-1 uppercase tracking-wider">Arguments</p>
              <pre className="text-xs font-mono text-text-secondary whitespace-pre-wrap break-all">
                {JSON.stringify(toolCall.arguments, null, 2)}
              </pre>
            </div>
          )}

          {toolCall.result && (
            <div>
              <p className="text-[10px] text-text-muted mb-1 uppercase tracking-wider">Result</p>
              <pre className="text-xs font-mono text-text-secondary whitespace-pre-wrap break-all max-h-40 overflow-y-auto">
                {toolCall.result}
              </pre>
            </div>
          )}

          {toolCall.error && (
            <div>
              <p className="text-[10px] text-error mb-1 uppercase tracking-wider">Error</p>
              <pre className="text-xs font-mono text-error whitespace-pre-wrap">
                {toolCall.error}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
