import { Bot, MessageSquare, Loader2, AlertCircle, MapPin, Plus, Search } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
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
  const location = useLocation()
  const navigate = useNavigate()
  
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [showContextForm, setShowContextForm] = useState(false)
  
  const selection = useMapStore(state => state.selection)
  
  // Dynamic Context State
  const initialNavState = location.state as any || {}
  const [activeContextType, setActiveContextType] = useState<string>(initialNavState.contextType || (selection?.kind ? selection.kind : 'None'))
  const [activeRoadName, setActiveRoadName] = useState<string>(initialNavState.roadName || (selection?.kind === 'road' ? selection.road.roadName : 'Unknown'))
  const [activeLat, setActiveLat] = useState<number | null>(initialNavState.latitude || (selection?.kind === 'road' ? selection.road.lat : selection?.kind === 'location' ? selection.lat : null))
  const [activeLng, setActiveLng] = useState<number | null>(initialNavState.longitude || (selection?.kind === 'road' ? selection.road.lng : selection?.kind === 'location' ? selection.lng : null))
  const [activeComplaintId, setActiveComplaintId] = useState<string | null>(initialNavState.complaintId || (selection?.kind === 'complaint' ? selection.complaint.id : null))
  
  // Geocode state for location contexts
  const [resolvedCity, setResolvedCity] = useState<string>('Resolving...')
  const [resolvedState, setResolvedState] = useState<string>('')
  
  useEffect(() => {
    if (activeContextType === 'location' && activeLat && activeLng) {
      fetch(`http://localhost:3000/api/intelligence/geocode?lat=${activeLat}&lng=${activeLng}`)
        .then(res => res.json())
        .then(data => {
          if (data.city) {
            setResolvedCity(data.city)
            setResolvedState(data.state)
          }
        })
        .catch(() => {
          setResolvedCity('Unknown Area')
        })
    }
  }, [activeContextType, activeLat, activeLng])

  const callAiEndpoint = async (promptText: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const res = await fetch('http://localhost:3000/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: promptText, 
          contextRoadName: activeRoadName !== 'Unknown' ? activeRoadName : undefined,
          contextComplaintId: activeComplaintId,
          latitude: activeLat,
          longitude: activeLng
        })
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
    const target = activeRoadName !== 'Unknown' ? activeRoadName : resolvedCity
    const rtiPrompt = `Generate a formal RTI request for: ${target}\n\nUser question:\n${prompt}`
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
  
  const handleContextSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const contextQuery = formData.get('contextQuery') as string
    if (contextQuery && contextQuery.trim()) {
      setActiveContextType('road')
      setActiveRoadName(contextQuery.trim())
      setShowContextForm(false)
    }
  }

  return (
    <PageContainer size="default" className="gap-6">
      <SectionHeader
        title={t('aiTitle')}
        description={assistantPageCopy.description}
      />

      {/* Global AI Context Panel */}
      <Card className="border-[var(--rw-border-strong)] bg-[var(--rw-surface-muted)]">
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-sm flex items-center gap-2">
              <MapPin className="size-4 text-[var(--rw-primary)]" />
              Active Intelligence Context
            </CardTitle>
            <CardDescription>
              CrashZero AI is analyzing this specific data context.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowContextForm(!showContextForm)}>
            <Plus className="size-3 mr-2" />
            {showContextForm ? 'Cancel' : 'Add Context'}
          </Button>
        </CardHeader>
        
        {showContextForm && (
          <div className="px-6 pb-4">
            <form onSubmit={handleContextSubmit} className="flex flex-col gap-3 rounded-md border border-[var(--rw-border)] p-4 bg-[var(--rw-surface)]">
              <p className="text-sm text-[var(--rw-text-secondary)]">Search for a specific road, or enter map coordinates.</p>
              <div className="flex items-center gap-2">
                <Search className="size-4 text-[var(--rw-text-tertiary)]" />
                <input 
                  type="text"
                  name="contextQuery"
                  placeholder="E.g. Sardar Patel Road" 
                  className="flex-1 bg-transparent border-b border-[var(--rw-border)] py-1 focus:outline-none focus:border-[var(--rw-primary)] text-[var(--rw-text-primary)]"
                  autoFocus
                />
              </div>
              <Button type="submit" size="sm" className="w-fit mt-2">Confirm Context</Button>
            </form>
          </div>
        )}
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <p className="text-[var(--rw-text-tertiary)] font-medium mb-1">Context Type</p>
              <p className="text-[var(--rw-text-primary)] capitalize">{activeContextType}</p>
            </div>
            
            {activeContextType === 'location' && (
              <>
                <div>
                  <p className="text-[var(--rw-text-tertiary)] font-medium mb-1">City</p>
                  <p className="text-[var(--rw-text-primary)] truncate">{resolvedCity}</p>
                </div>
                <div>
                  <p className="text-[var(--rw-text-tertiary)] font-medium mb-1">State</p>
                  <p className="text-[var(--rw-text-primary)] truncate">{resolvedState}</p>
                </div>
              </>
            )}
            
            {(activeContextType === 'road' || activeContextType === 'None') && (
              <>
                <div>
                  <p className="text-[var(--rw-text-tertiary)] font-medium mb-1">Road Name</p>
                  <p className="text-[var(--rw-text-primary)] truncate">{activeRoadName}</p>
                </div>
                {activeRoadName !== 'Unknown' && (
                  <>
                    <div>
                      <p className="text-[var(--rw-text-tertiary)] font-medium mb-1">Authority</p>
                      <p className="text-[var(--rw-text-primary)] truncate">PWD Maharashtra</p>
                    </div>
                    <div>
                      <p className="text-[var(--rw-text-tertiary)] font-medium mb-1">Budget Sanctioned</p>
                      <p className="text-[var(--rw-text-primary)] truncate">₹450 Cr</p>
                    </div>
                    <div>
                      <p className="text-[var(--rw-text-tertiary)] font-medium mb-1">Budget Spent</p>
                      <p className="text-[var(--rw-text-primary)] truncate">₹120 Cr</p>
                    </div>
                    <div>
                      <p className="text-[var(--rw-text-tertiary)] font-medium mb-1">Contractor</p>
                      <p className="text-[var(--rw-text-primary)] truncate">L&T Infra</p>
                    </div>
                    <div>
                      <p className="text-[var(--rw-text-tertiary)] font-medium mb-1">Complaint Count</p>
                      <p className="text-[var(--rw-text-primary)] truncate">12</p>
                    </div>
                  </>
                )}
              </>
            )}

            {activeContextType === 'complaint' && activeComplaintId && (
              <>
                <div>
                  <p className="text-[var(--rw-text-tertiary)] font-medium mb-1">Complaint ID</p>
                  <p className="text-[var(--rw-text-primary)] font-mono">{activeComplaintId}</p>
                </div>
                <div>
                  <p className="text-[var(--rw-text-tertiary)] font-medium mb-1">Status</p>
                  <p className="text-[var(--rw-text-primary)] font-mono">IN_PROGRESS</p>
                </div>
                <div>
                  <p className="text-[var(--rw-text-tertiary)] font-medium mb-1">Severity</p>
                  <p className="text-[var(--rw-danger)] font-bold">High</p>
                </div>
              </>
            )}
            
            {activeLat && activeLng && (
              <div className="col-span-2 md:col-span-1">
                <p className="text-[var(--rw-text-tertiary)] font-medium mb-1">Coordinates</p>
                <p className="text-[var(--rw-text-primary)] font-mono">{activeLat.toFixed(4)}, {activeLng.toFixed(4)}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
                Powered by Gemini • Contextually Grounded
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
                  Generating contextual response...
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
