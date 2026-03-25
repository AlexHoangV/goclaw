import { useEffect, useCallback } from 'react'
import { getWsClient } from '../lib/ws'
import { useSessionStore } from '../stores/session-store'
import { useAgentStore } from '../stores/agent-store'
import { useChatStore } from '../stores/chat-store'

export function useSessions() {
  const ws = getWsClient()
  const { sessions, activeSessionKey, setActiveSession, setSessions, addSession } = useSessionStore()
  const selectedAgentId = useAgentStore((s) => s.selectedAgentId)

  useEffect(() => {
    if (!ws || !selectedAgentId) return
    let cancelled = false
    const agentId = selectedAgentId
    ws.call('sessions.list', { agentId, limit: 20 })
      .then((result: unknown) => {
        if (cancelled) return
        const r = result as { sessions?: Array<{ key?: string; sessionKey?: string; title?: string; name?: string; lastMessageAt?: number; updatedAt?: number; messageCount?: number }> }
        const list = (r?.sessions || []).map((s) => ({
          key: s.key || s.sessionKey || '',
          agentId,
          title: s.title || s.name || 'Untitled',
          lastMessageAt: s.lastMessageAt || s.updatedAt || Date.now(),
          messageCount: s.messageCount || 0,
        }))
        setSessions(list)
      })
      .catch(console.error)
    return () => { cancelled = true }
  }, [ws, selectedAgentId, setSessions])

  const createSession = useCallback(() => {
    if (!selectedAgentId) return
    const key = `agent:${selectedAgentId}:ws:direct:desktop-user:${crypto.randomUUID().slice(0, 8)}`
    const session = {
      key,
      agentId: selectedAgentId,
      title: 'New Chat',
      lastMessageAt: Date.now(),
      messageCount: 0,
    }
    addSession(session)
    setActiveSession(key)
    useChatStore.getState().clear()
  }, [selectedAgentId, addSession, setActiveSession])

  return { sessions, activeSessionKey, setActiveSession, createSession }
}
