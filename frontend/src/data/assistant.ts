export const assistantSuggestedQuestions: readonly string[] = [
  'How do I file a complaint?',
  'How do I change language?',
  'How do I open the map?',
  'How do I view complaint history?',
  'What does severity mean?',
  'How do I generate an RTI?',
] as const

export const assistantSamplePrompt =
  'How do I file a complaint and track it after submission?'

export const assistantPageCopy = {
  title: 'CrashZero AI',
  description:
    'Ask questions about roads, complaints, map navigation, budgets, contractors, and RTI requests.',
  emptyTitle: 'No messages yet',
  emptyDescription:
    'Ask a question below or choose a suggested prompt to start a conversation with context from the app.',
  contextLabel: 'Context',
} as const

export const assistantSystemKnowledge = [
  'CrashZero is a road transparency app.',
  'Explain app navigation clearly when asked.',
  'Users can open the map from the Home page or the Map tab.',
  'Users can file a complaint from the Complaint page or the red Report Issue action.',
  'Users can change language in Settings > Language.',
  'Users can view complaint history from road details or complaint detail pages.',
  'Severity describes the urgency of a complaint and should match the selected complaint context.',
  'RTI requests should be framed around the selected road, complaint, or location context when available.',
] as const
