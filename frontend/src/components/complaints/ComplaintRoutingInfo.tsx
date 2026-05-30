import { Building2, Hash, MapPinned, Route } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../common/Card'

export type ComplaintRoutingInfoProps = {
  complaintId?: string
  roadType?: string
  issueType?: string
  assignedAuthority?: string
  assignedDepartment?: string
  compact?: boolean
}

export function ComplaintRoutingInfo({
  complaintId,
  roadType,
  issueType,
  assignedAuthority,
  assignedDepartment,
  compact = false,
}: ComplaintRoutingInfoProps) {
  if (!complaintId && !roadType && !assignedAuthority) {
    return null
  }

  const rows = [
    { label: 'Complaint ID', value: complaintId, icon: Hash },
    { label: 'Road Type', value: roadType, icon: Route },
    { label: 'Issue Type', value: issueType, icon: MapPinned },
    { label: 'Assigned Authority', value: assignedAuthority, icon: Building2 },
    { label: 'Assigned Department', value: assignedDepartment, icon: Building2 },
  ].filter((row) => row.value)

  if (rows.length === 0) {
    return null
  }

  if (compact) {
    return (
      <dl className="grid gap-2 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-col gap-0.5">
            <dt className="text-xs font-medium uppercase tracking-wide text-[var(--rw-text-tertiary)]">
              {row.label}
            </dt>
            <dd className="font-medium text-[var(--rw-text-primary)]">{row.value}</dd>
          </div>
        ))}
      </dl>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Routing Assignment</CardTitle>
        <CardDescription>
          Your complaint has been routed to the responsible authority.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          {rows.map((row) => {
            const Icon = row.icon
            return (
              <div key={row.label} className="rounded-lg border border-[var(--rw-border)] p-3">
                <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-[var(--rw-text-tertiary)]">
                  <Icon className="size-3.5 shrink-0" aria-hidden="true" />
                  {row.label}
                </dt>
                <dd className="mt-1 font-medium text-[var(--rw-text-primary)]">{row.value}</dd>
              </div>
            )
          })}
        </dl>
      </CardContent>
    </Card>
  )
}
