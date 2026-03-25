import { useEffect, useRef, useCallback } from 'react'
import { getWsClient } from '../lib/ws'
import { useChatStore } from '../stores/chat-store'
import { useSessionStore } from '../stores/session-store'
import type { Message } from '../stores/chat-store'

// RAF batching — prevents 100+ setState calls/sec during streaming
function useStreamBatcher(onFlush: (text: string) => void) {
  const bufferRef = useRef('')
  const rafRef = useRef(0)

  const append = useCallback(
    (text: string) => {
      bufferRef.current += text
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(() => {
          onFlush(bufferRef.current)
          bufferRef.current = ''
          rafRef.current = 0
        })
      }
    },
    [onFlush],
  )

  const flush = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
    }
    if (bufferRef.current) {
      onFlush(bufferRef.current)
      bufferRef.current = ''
    }
  }, [onFlush])

  return { append, flush }
}

export function useChat() {
  const ws = getWsClient()
  const {
    messages,
    isRunning,
    activity,
    addUserMessage,
    startRun,
    appendChunk,
    appendThinking,
    addToolCall,
    updateToolResult,
    setActivity,
    completeRun,
    failRun,
    setMessages,
  } = useChatStore()

  const activeSessionKey = useSessionStore((s) => s.activeSessionKey)
  const currentRunIdRef = useRef<string | null>(null)

  const chunkBatcher = useStreamBatcher(
    useCallback((text: string) => appendChunk(text), [appendChunk]),
  )
  const thinkingBatcher = useStreamBatcher(
    useCallback((text: string) => appendThinking(text), [appendThinking]),
  )

  useEffect(() => {
    if (!ws) return

    const unsub = ws.on('agent', (raw: unknown) => {
      const event = raw as {
        type: string
        runId: string
        sessionKey: string
        payload: Record<string, unknown>
      }

      if (activeSessionKey && event.sessionKey !== activeSessionKey) return

      switch (event.type) {
        case 'run.started':
          currentRunIdRef.current = event.runId
          startRun(event.runId)
          break

        case 'chunk':
          chunkBatcher.append(event.payload.chunk as string)
          break

        case 'thinking':
          thinkingBatcher.append(event.payload.thinking as string)
          break

        case 'tool.call':
          // Flush pending text before showing tool card
          chunkBatcher.flush()
          addToolCall({
            toolId: event.payload.toolId as string,
            toolName: event.payload.toolName as string,
            arguments: event.payload.arguments as Record<string, unknown>,
          })
          break

        case 'tool.result':
          updateToolResult(
            event.payload.toolId as string,
            event.payload.result as string,
            event.payload.error as string | undefined,
          )
          break

        case 'activity':
          setActivity({
            phase: event.payload.phase as 'thinking' | 'tool_exec' | 'compacting',
            tool: event.payload.tool as string | undefined,
            iteration: event.payload.iteration as number | undefined,
          })
          break

        case 'run.completed': {
          chunkBatcher.flush()
          thinkingBatcher.flush()
          const p = event.payload
          completeRun(
            p.content as string,
            p.usage as { inputTokens: number; outputTokens: number } | undefined,
            p.media as { type: string; url: string }[] | undefined,
          )
          currentRunIdRef.current = null
          break
        }

        case 'run.failed':
          chunkBatcher.flush()
          thinkingBatcher.flush()
          failRun(event.payload.error as string)
          currentRunIdRef.current = null
          break
      }
    })

    return unsub
  }, [
    ws,
    activeSessionKey,
    startRun,
    addToolCall,
    updateToolResult,
    setActivity,
    completeRun,
    failRun,
    chunkBatcher,
    thinkingBatcher,
  ])

  const sendMessage = useCallback(
    async (text: string, agentId: string) => {
      if (!ws || !text.trim()) return

      addUserMessage(text)

      try {
        await ws.call('chat.send', {
          message: text,
          agentId,
          sessionKey: activeSessionKey ?? undefined,
          stream: true,
        })
      } catch (err) {
        console.error('chat.send failed:', err)
      }
    },
    [ws, activeSessionKey, addUserMessage],
  )

  const loadHistory = useCallback(
    async (sessionKey: string) => {
      if (!ws) return
      try {
        const result = (await ws.call('chat.history', { sessionKey })) as {
          messages?: Array<{
            id?: string
            role: Message['role']
            content?: string
            timestamp?: number
          }>
        }
        if (result?.messages) {
          setMessages(
            result.messages.map((m) => ({
              id: m.id ?? crypto.randomUUID(),
              role: m.role,
              content: m.content ?? '',
              timestamp: m.timestamp ?? Date.now(),
            })),
          )
        }
      } catch (err) {
        console.error('Failed to load history:', err)
      }
    },
    [ws, setMessages],
  )

  return {
    messages,
    isRunning,
    activity,
    sendMessage,
    loadHistory,
  }
}
