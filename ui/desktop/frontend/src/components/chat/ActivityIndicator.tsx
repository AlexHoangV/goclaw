interface ActivityIndicatorProps {
  phase: 'thinking' | 'tool_exec' | 'compacting'
  tool?: string
  iteration?: number
}

export function ActivityIndicator({ phase, tool, iteration }: ActivityIndicatorProps) {
  const label = {
    thinking: 'Thinking',
    tool_exec: tool ? `Running ${tool}` : 'Executing tool',
    compacting: 'Compacting context',
  }[phase]

  return (
    <div className="flex items-center gap-2 py-2 text-xs text-text-muted">
      <span className="flex gap-0.5">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="w-1 h-1 rounded-full bg-accent animate-bounce"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </span>
      <span>{label}</span>
      {iteration && iteration > 1 && (
        <span className="text-text-muted">· step {iteration}</span>
      )}
    </div>
  )
}
