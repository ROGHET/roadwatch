import { Loader2 } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useAssistantChatStore } from '../../stores/assistantChatStore'

type AssistantChatPanelProps = {
  isLoading: boolean
}

function formatTimestamp(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function AssistantChatPanel({ isLoading }: AssistantChatPanelProps) {
  const messages = useAssistantChatStore((state) => state.messages)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  if (messages.length === 0 && !isLoading) {
    return null
  }

  return (
    <div className="max-h-[420px] space-y-3 overflow-y-auto rounded-md border border-[var(--rw-border)] bg-[var(--rw-surface-muted)] p-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={[
            'flex',
            message.role === 'user' ? 'justify-end' : 'justify-start',
          ].join(' ')}
        >
          <div
            className={[
              'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm',
              message.role === 'user'
                ? 'bg-[var(--st-primary)] text-[var(--st-on-primary)]'
                : 'border border-[var(--rw-border)] bg-[var(--rw-surface)] text-[var(--rw-text-primary)]',
            ].join(' ')}
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
            <p
              className={[
                'mt-1 text-[10px] opacity-70',
                message.role === 'user' ? 'text-right' : 'text-left',
              ].join(' ')}
            >
              {formatTimestamp(message.timestamp)}
            </p>
          </div>
        </div>
      ))}

      {isLoading ? (
        <div className="flex justify-start">
          <div className="inline-flex items-center gap-2 rounded-2xl border border-[var(--rw-border)] bg-[var(--rw-surface)] px-4 py-2 text-sm text-[var(--rw-text-secondary)]">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Generating contextual response...
          </div>
        </div>
      ) : null}

      <div ref={chatEndRef} />
    </div>
  )
}
