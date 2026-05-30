import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ChatMessageRole = 'user' | 'assistant'

export type ChatMessage = {
  id: string
  role: ChatMessageRole
  content: string
  timestamp: string
}

type AssistantChatState = {
  messages: ChatMessage[]
  addMessage: (role: ChatMessageRole, content: string) => void
  clearMessages: () => void
}

function createMessageId() {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export const useAssistantChatStore = create<AssistantChatState>()(
  persist(
    (set) => ({
      messages: [],
      addMessage: (role, content) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              id: createMessageId(),
              role,
              content,
              timestamp: new Date().toISOString(),
            },
          ],
        })),
      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: 'rw-assistant-chat',
    },
  ),
)
