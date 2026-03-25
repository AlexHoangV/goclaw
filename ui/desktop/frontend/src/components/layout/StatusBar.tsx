import { useEffect, useState } from 'react'
import { getWsClient } from '../../lib/ws'

export function StatusBar() {
  const [connected, setConnected] = useState(() => {
    const ws = getWsClient()
    return ws?.isConnected ?? false
  })

  useEffect(() => {
    const ws = getWsClient()
    if (!ws) return
    ws.onConnectionChange(setConnected)
  }, [])

  return (
    <footer className="h-6 flex items-center px-3 bg-surface-secondary border-t border-border text-[11px] text-text-muted shrink-0">
      <div className="flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-success' : 'bg-error'}`} />
        <span>{connected ? 'Connected' : 'Disconnected'}</span>
      </div>
      <div className="flex-1" />
      <span>Lite Edition</span>
    </footer>
  )
}
