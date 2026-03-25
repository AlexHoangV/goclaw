import { useState, useRef, useCallback, type KeyboardEvent } from 'react'

interface InputBarProps {
  onSend: (text: string) => void
  onStop?: () => void
  disabled?: boolean
  isRunning?: boolean
  placeholder?: string
}

export function InputBar({ onSend, onStop, disabled, isRunning, placeholder }: InputBarProps) {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = useCallback(() => {
    if (!text.trim() || disabled) return
    onSend(text.trim())
    setText('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [text, disabled, onSend])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'
  }

  return (
    <div className="border-t border-border p-3 shrink-0">
      <div className="max-w-3xl mx-auto flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => { setText(e.target.value); handleInput() }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? 'Type a message...'}
          disabled={disabled}
          rows={1}
          className="flex-1 bg-surface-tertiary text-text-primary text-base md:text-sm rounded-lg px-3 py-2.5 border border-border focus:outline-none focus:ring-1 focus:ring-accent placeholder:text-text-muted resize-none overflow-hidden"
          style={{ maxHeight: 200 }}
        />

        {isRunning ? (
          <button
            onClick={onStop}
            className="px-4 py-2.5 bg-error text-white text-sm rounded-lg font-medium hover:opacity-90 transition-opacity shrink-0"
          >
            Stop
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!text.trim() || disabled}
            className="px-4 py-2.5 bg-accent text-white text-sm rounded-lg font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            Send
          </button>
        )}
      </div>
    </div>
  )
}
