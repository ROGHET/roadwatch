export type AssistantRoadContext = {
  roadId: string
  roadName: string
  authority: string
  contractor: string
}

export const assistantDefaultContext: AssistantRoadContext = {
  roadId: 'chennai-sardar-patel-road',
  roadName: 'Sardar Patel Road',
  authority: 'Tamil Nadu State Highways Department',
  contractor: 'Tamil Nadu Road Development Company Ltd.',
}

export const assistantSuggestedQuestions: readonly string[] = [
  'Who maintains this road?',
  'Who is responsible for repairs on this corridor?',
  'How much money was sanctioned and spent on this road?',
  'When was this road last repaired?',
  'Show complaint history for this road.',
  'Which authority should receive a new complaint?',
  'Generate an RTI request for maintenance records.',
]

export const assistantSamplePrompt =
  'Who is responsible for maintaining Sardar Patel Road and what was the last sanctioned repair budget?'

export const assistantPageCopy = {
  title: 'CrashZero AI',
  description:
    'Ask road-related questions about maintenance, budgets, contractors, complaint history, and RTI requests.',
  emptyTitle: 'No messages yet',
  emptyDescription:
    'Ask a question below or choose a suggested prompt to start a conversation about the selected road.',
  contextLabel: 'Context',
} as const
