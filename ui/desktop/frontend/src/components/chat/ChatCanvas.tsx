import { useEffect, useRef, useCallback, useMemo } from 'react'
import { useChat } from '../../hooks/use-chat'
import { useAgents } from '../../hooks/use-agents'
import { ChatTopBar } from './ChatTopBar'
import { MessageBubble } from './MessageBubble'
import { ActivityIndicator } from './ActivityIndicator'
import { InputBar } from './InputBar'

export function ChatCanvas() {
  const { messages, isRunning, activity, sendMessage } = useChat()
  const { selectedAgent } = useAgents()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const userScrolledUp = useRef(false)

  // Find last assistant message ID for streaming cursor
  const lastAssistantId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') return messages[i].id
    }
    return null
  }, [messages])

  useEffect(() => {
    if (!userScrolledUp.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: isRunning ? 'smooth' : 'instant' })
    }
  }, [messages, isRunning])

  const handleScroll = useCallback(() => {
    const el = scrollAreaRef.current
    if (!el) return
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50
    userScrolledUp.current = !atBottom
  }, [])

  const handleSend = useCallback((text: string) => {
    if (!selectedAgent) return
    userScrolledUp.current = false
    sendMessage(text, selectedAgent.id)
  }, [selectedAgent, sendMessage])

  const hasMessages = messages.length > 0

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <ChatTopBar />

      {/* Chat body — dots background covers messages + input */}
      <div className="flex-1 flex flex-col min-h-0 canvas-dots">
        {/* Messages area */}
        <div
          ref={scrollAreaRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto overscroll-contain px-4 py-2"
        >
          <div className="max-w-3xl mx-auto">
            {!selectedAgent && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-sm text-text-muted">Loading agent...</p>
              </div>
            )}
            {selectedAgent && !hasMessages && <EmptyState agentName={selectedAgent.name} />}

            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isStreaming={isRunning && msg.id === lastAssistantId}
              />
            ))}

            {isRunning && activity && (
              <ActivityIndicator phase={activity.phase} tool={activity.tool} iteration={activity.iteration} />
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input bar */}
        <InputBar
          onSend={handleSend}
          disabled={!selectedAgent}
          isRunning={isRunning}
          placeholder={selectedAgent ? `Message ${selectedAgent.name}...` : 'Select an agent first'}
        />
      </div>
    </div>
  )
}

/** Empty state with logo and suggested prompts */
function EmptyState({ agentName }: { agentName?: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      <img src="/goclaw-icon.svg" alt="GoClaw" className="h-14 w-14 mb-5 opacity-30" />
      <h2 className="text-lg font-medium text-text-primary mb-1">
        {agentName ? `Chat with ${agentName}` : 'Start a conversation'}
      </h2>
      <p className="text-sm text-text-muted max-w-sm mb-6">
        {agentName
          ? 'Ask a question, write something, or explore ideas.'
          : 'Select an agent from the sidebar to begin.'}
      </p>
      {agentName && (
        <div className="flex flex-wrap justify-center gap-2">
          {['What can you help me with?', 'Summarize something for me', 'Help me brainstorm'].map((prompt) => (
            <span
              key={prompt}
              className="text-xs text-text-secondary bg-surface-secondary border border-border rounded-full px-3 py-1.5 opacity-60"
            >
              {prompt}
            </span>
          ))}
        </div>
      )}
      <p className="text-[10px] text-text-muted mt-4">
        Press <kbd className="px-1 py-0.5 bg-surface-tertiary rounded text-[10px] font-mono">⌘N</kbd> for new chat
      </p>
    </div>
  )
}
