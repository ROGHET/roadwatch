import { Building2, Calendar, User } from 'lucide-react'
import { type ReactNode } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../common/Card'
import { RiskIndicator, type RiskLevel } from './RiskIndicator'
import { RoadScoreBadge, type RoadScoreTier } from './RoadScoreBadge'
import { RoadStatusBadge, type RoadStatus } from './RoadStatusBadge'

export type RoadSummaryCardProps = {
  roadName: string
  roadType?: string
  score: number
  scoreTier: RoadScoreTier
  status: RoadStatus
  riskLevel: RiskLevel
  contractor?: string
  authority?: string
  lastRepairDate?: string
  footer?: ReactNode
  className?: string
}

export function RoadSummaryCard({
  roadName,
  roadType,
  score,
  scoreTier,
  status,
  riskLevel,
  contractor,
  authority,
  lastRepairDate,
  footer,
  className,
}: RoadSummaryCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            <CardTitle className="truncate text-base">{roadName}</CardTitle>
            {roadType ? (
              <CardDescription className="capitalize">{roadType}</CardDescription>
            ) : null}
          </div>
          <RoadScoreBadge score={score} tier={scoreTier} />
        </div>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <RoadStatusBadge status={status} />
          <RiskIndicator level={riskLevel} />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {contractor ? (
          <p className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <User className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{contractor}</span>
          </p>
        ) : null}
        {authority ? (
          <p className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <Building2 className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{authority}</span>
          </p>
        ) : null}
        {lastRepairDate ? (
          <p className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <Calendar className="size-4 shrink-0" aria-hidden="true" />
            <span>
              Last repair: <time>{lastRepairDate}</time>
            </span>
          </p>
        ) : null}
      </CardContent>
      {footer ? <CardFooter>{footer}</CardFooter> : null}
    </Card>
  )
}
