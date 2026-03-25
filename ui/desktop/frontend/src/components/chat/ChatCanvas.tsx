import { useEffect, useRef, useCallback } from 'react'
import { useChat } from '../../hooks/use-chat'
import { useAgents } from '../../hooks/use-agents'
import { MessageBubble } from './MessageBubble'
import { ActivityIndicator } from './ActivityIndicator'
import { InputBar } from './InputBar'

export function ChatCanvas() {
  const { messages, isRunning, activity, sendMessage } = useChat()
  const { selectedAgent } = useAgents()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const userScrolledUp = useRef(false)

  // Auto-scroll on new messages/chunks
  useEffect(() => {
    if (!userScrolledUp.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: isRunning ? 'smooth' : 'instant' })
    }
  }, [messages, isRunning])

  // Track if user scrolled up
  const handleScroll = useCallback(() => {
    const el = scrollAreaRef.current
    if (!el) return
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50
    userScrolledUp.current = !atBottom
  }, [])

  const handleSend = useCallback((text: string) => {
    if (!selectedAgent) return
    userScrolledUp.current = false
    sendMessage(text, selectedAgent.key)
  }, [selectedAgent, sendMessage])

  const hasMessages = messages.length > 0

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Context bar */}
      <div className="h-10 flex items-center px-4 border-b border-border shrink-0">
        {selectedAgent ? (
          <span className="text-sm text-text-secondary">
            {selectedAgent.name} · {selectedAgent.model}
          </span>
        ) : (
          <span className="text-sm text-text-muted">Select an agent to start chatting</span>
        )}
      </div>

      {/* Messages area */}
      <div
        ref={scrollAreaRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overscroll-contain p-4"
      >
        <div className="max-w-3xl mx-auto">
          {!hasMessages && (
            <div className="flex flex-col items-center justify-center text-center py-20">
              <h2 className="text-lg font-medium text-text-primary mb-2">Welcome to GoClaw</h2>
              <p className="text-sm text-text-muted max-w-md">
                {selectedAgent
                  ? `Start a conversation with ${selectedAgent.name}`
                  : 'Select an agent from the sidebar to start a conversation.'}
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {isRunning && activity && (
            <ActivityIndicator
              phase={activity.phase}
              tool={activity.tool}
              iteration={activity.iteration}
            />
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
  )
}
