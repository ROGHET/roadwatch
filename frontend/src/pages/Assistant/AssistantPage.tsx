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

const suggestedQuestions = [
  'Who maintains this road?',
  'How much money was spent?',
  'When was this repaired?',
  'Show complaint history.',
  'Generate RTI request.',
]

export default function AssistantPage() {
  return (
    <PageContainer size="default" className="gap-6">
      <SectionHeader
        title="RoadWatch AI"
        description="Ask road-related questions about maintenance, budgets, contractors, and complaints."
      />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div
              className="flex size-10 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800"
              aria-hidden="true"
            >
              <Bot className="size-5 text-slate-700 dark:text-slate-300" />
            </div>
            <div>
              <CardTitle className="text-base">Assistant</CardTitle>
              <CardDescription>
                Context: Sardar Patel Road (placeholder)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <EmptyState
            icon={MessageSquare}
            title="No messages yet"
            description="Ask a question below or choose a suggested prompt to start."
            className="py-8"
          />
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question) => (
              <Badge key={question} variant="outline" className="cursor-default px-3 py-1.5">
                {question}
              </Badge>
            ))}
          </div>
          <Textarea
            id="assistant-prompt"
            placeholder="Ask a question about this road..."
            rows={4}
            readOnly
            defaultValue="Who is responsible for maintaining Sardar Patel Road?"
          />
        </CardContent>
        <CardFooter className="flex flex-wrap gap-3">
          <Button type="button" disabled>
            Send message
          </Button>
          <Button type="button" variant="outline" disabled>
            Generate RTI request
          </Button>
        </CardFooter>
      </Card>
    </PageContainer>
  )
}
