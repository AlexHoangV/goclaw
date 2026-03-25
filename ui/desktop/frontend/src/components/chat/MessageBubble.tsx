import type { Message } from '../../stores/chat-store'
import { formatTimestamp, formatTokens } from '../../lib/format'
import { ThinkingBlock } from './ThinkingBlock'
import { ToolCallBlock } from './ToolCallBlock'
import { MarkdownRenderer } from './MarkdownRenderer'
import { MediaBlock } from './MediaBlock'

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[85%] bg-user-bubble rounded-2xl rounded-br-md px-4 py-3">
          <p className="text-sm text-text-primary whitespace-pre-wrap">{message.content}</p>
          <time className="text-[10px] text-text-muted mt-1 block text-right">
            {formatTimestamp(message.timestamp)}
          </time>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6">
      {message.thinkingText && <ThinkingBlock text={message.thinkingText} />}

      {message.toolCalls?.map((tc) => (
        <ToolCallBlock key={tc.toolId} toolCall={tc} />
      ))}

      {message.content && (
        <div className="prose-container">
          <MarkdownRenderer content={message.content} />
        </div>
      )}

      {message.media?.length ? <MediaBlock items={message.media} /> : null}

      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-text-muted">
        <time>{formatTimestamp(message.timestamp)}</time>
        {message.usage && (
          <span>
            · {formatTokens(message.usage.inputTokens + message.usage.outputTokens)} tokens
          </span>
        )}
      </div>
    </div>
  )
}
