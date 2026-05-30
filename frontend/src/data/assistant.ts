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
  'Users can open the Dashboard from the top navigation dashboard icon or command palette.',
  'Users can file a complaint from the Complaint page or the map Report Issue action.',
  'Users can change language in Settings > Language or the Language page.',
  'Users can change theme (dark, light, or system) from Settings or the profile menu.',
  'Accessibility options such as font size are available in Settings.',
  'Users can view complaint history from road details or complaint detail pages.',
  'Users can track a complaint from the Complaint page using the complaint ID.',
  'Severity describes the urgency of a complaint and should match the selected complaint context.',
  'RTI requests should be framed around the selected road, complaint, or location context when available.',
  'The command palette (Ctrl+K) can open map, dashboard, complaint, settings, theme, and language actions.',
] as const
