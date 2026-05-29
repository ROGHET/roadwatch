import { Bot, MessageSquare } from 'lucide-react'
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
  assistantDefaultContext,
  assistantPageCopy,
  assistantSamplePrompt,
  assistantSuggestedQuestions,
} from '../../data/assistant'
import { useI18n } from '../../lib/i18n'

export default function AssistantPage() {
  const { t } = useI18n()

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
                {assistantPageCopy.contextLabel}: {assistantDefaultContext.roadName}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <EmptyState
            icon={MessageSquare}
            title={assistantPageCopy.emptyTitle}
            description={assistantPageCopy.emptyDescription}
            className="py-8"
          />
          <div className="flex flex-wrap gap-2">
            {assistantSuggestedQuestions.map((question) => (
              <Badge key={question} variant="outline" className="cursor-default px-3 py-1.5">
                {question}
              </Badge>
            ))}
          </div>
          <Textarea
            id="assistant-prompt"
            placeholder={t('aiPlaceholder')}
            rows={4}
            readOnly
            defaultValue={assistantSamplePrompt}
          />
        </CardContent>
        <CardFooter className="flex flex-wrap gap-3">
          <Button type="button" disabled>
            {t('sendMessage')}
          </Button>
          <Button type="button" variant="outline" disabled>
            {t('generateRti')}
          </Button>
        </CardFooter>
      </Card>
    </PageContainer>
  )
}
