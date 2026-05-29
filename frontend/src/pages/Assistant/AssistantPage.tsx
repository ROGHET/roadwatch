import { Bot, MessageSquare, Loader2, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/common/Card'
import { PageContainer } from '../../components/common/PageContainer'
import { SectionHeader } from '../../components/common/SectionHeader'
import { Textarea } from '../../components/common/Textarea'
import { EmptyState } from '../../components/common/EmptyState'
import {
  assistantPageCopy,
  assistantSuggestedQuestions,
} from '../../data/assistant'
import { useI18n } from '../../lib/i18n'
import { useMapStore } from '../../stores/mapStore'

export default function AssistantPage() {
  const { t } = useI18n()
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const selection = useMapStore(state => state.selection)
  const selectedRoadName = selection?.kind === 'road' ? selection.road.roadName : null
  const contextLabel = selectedRoadName || 'No road selected'

  const callAiEndpoint = async (promptText: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const res = await fetch('http://localhost:3000/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText, contextRoadName: selectedRoadName })
      })

      if (!res.ok) {
        throw new Error('Failed to communicate with AI Assistant')
      }

      const data = await res.json()
      setResponse(data.response)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSend = () => {
    if (!prompt.trim() || isLoading) return
    callAiEndpoint(prompt)
  }

  const handleGenerateRti = () => {
    if (isLoading) return
    const targetRoad = selectedRoadName || 'Unknown Road'
    const rtiPrompt = `Generate a formal RTI request for: ${targetRoad}\n\nUser question:\n${prompt}`
    callAiEndpoint(rtiPrompt)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSuggestedClick = (question: string) => {
    setPrompt(question)
  }

  return (
    <PageContainer size="default" className="gap-6">
      <SectionHeader
        title={t('aiTitle')}
        description={assistantPageCopy.description}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div
              className="flex size-10 items-center justify-center rounded-lg border border-[var(--rw-border)] bg-[var(--rw-surface-muted)]"
              aria-hidden="true"
            >
              <Bot className="size-5 text-[var(--rw-text-secondary)]" />
            </div>
            <div>
              <CardTitle className="text-base">{t('aiAssistant')}</CardTitle>
              <CardDescription>
                {t('assistantContextLabel')} {contextLabel}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!response && !error && !isLoading ? (
            <EmptyState
              icon={MessageSquare}
              title={t('assistantEmptyTitle')}
              description={t('assistantEmptyDescription')}
              className="py-8"
            />
          ) : (
            <div className="rounded-md border border-[var(--rw-border)] bg-[var(--rw-surface-muted)] p-4 text-sm min-h-[120px]">
              {isLoading ? (
                <div className="flex h-full items-center justify-center text-[var(--rw-text-secondary)]">
                  <Loader2 className="mr-2 size-5 animate-spin" />
                  Generating response...
                </div>
              ) : error ? (
                <div className="flex h-full items-center justify-center text-[var(--rw-danger)]">
                  <AlertCircle className="mr-2 size-5" />
                  {error}
                </div>
              ) : (
                <div className="whitespace-pre-wrap text-[var(--rw-text-primary)]">
                  {response}
                </div>
              )}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {assistantSuggestedQuestions.map((question) => (
              <Badge 
                key={question} 
                variant="outline" 
                className="cursor-pointer px-3 py-1.5 hover:bg-[var(--rw-surface-raised)]"
                onClick={() => handleSuggestedClick(question)}
              >
                {question}
              </Badge>
            ))}
          </div>
          <Textarea
            id="assistant-prompt"
            placeholder={t('aiPlaceholder')}
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
        </CardContent>
        <CardFooter className="flex flex-wrap gap-3">
          <Button type="button" onClick={handleSend} disabled={isLoading || !prompt.trim()}>
            {isLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            {t('sendMessage')}
          </Button>
          <Button type="button" variant="outline" onClick={handleGenerateRti} disabled={isLoading}>
            {t('generateRti')}
          </Button>
        </CardFooter>
      </Card>
    </PageContainer>
  )
}
