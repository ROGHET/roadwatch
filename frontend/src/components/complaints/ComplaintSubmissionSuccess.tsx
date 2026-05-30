import { forwardRef } from 'react'
import { Alert } from '../common/Alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../common/Card'

export type ComplaintSubmissionSuccessProps = {
  complaintId: string
  status: string
  roadType: string
  assignedAuthority: string
  assignedDepartment: string
}

function formatStatusLabel(status: string): string {
  return status
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export const ComplaintSubmissionSuccess = forwardRef<
  HTMLElement,
  ComplaintSubmissionSuccessProps
>(function ComplaintSubmissionSuccess(
  {
    complaintId,
    status,
    roadType,
    assignedAuthority,
    assignedDepartment,
  },
  ref,
) {
  const statusLabel = formatStatusLabel(status)

  return (
    <section ref={ref} id="complaint-success" className="scroll-mt-6 flex flex-col gap-4">
      <Alert variant="success" title="Complaint submitted">
        Your complaint was routed successfully. Details are below.
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Submission confirmed</CardTitle>
          <CardDescription>
            Save your complaint ID to track status later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            {[
              { label: 'Complaint ID', value: complaintId },
              { label: 'Status', value: statusLabel },
              { label: 'Road Type', value: roadType },
              { label: 'Assigned Authority', value: assignedAuthority },
              { label: 'Assigned Department', value: assignedDepartment },
            ].map((row) => (
              <div
                key={row.label}
                className="rounded-lg border border-[var(--rw-border)] p-3 sm:col-span-1"
              >
                <dt className="text-xs font-medium uppercase tracking-wide text-[var(--rw-text-tertiary)]">
                  {row.label}
                </dt>
                <dd className="mt-1 font-medium text-[var(--rw-text-primary)]">{row.value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </section>
  )
})
