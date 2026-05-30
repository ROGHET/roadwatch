import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '../common/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../common/Card'
import { Input } from '../common/Input'
import { Label } from '../common/Label'
import { lookupComplaint, type ComplaintLookupResult } from '../../lib/api/complaints'
import { useComplaintStore } from '../../stores/complaintStore'

export function TrackComplaintSection() {
  const findSubmittedByComplaintId = useComplaintStore((state) => state.findSubmittedByComplaintId)
  const [complaintId, setComplaintId] = useState('')
  const [result, setResult] = useState<ComplaintLookupResult | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleLookup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = complaintId.trim()
    if (!trimmed) {
      setErrorMessage('Enter a complaint ID to track.')
      setResult(null)
      return
    }

    setIsLoading(true)
    setErrorMessage(null)
    setResult(null)

    const localMatch = findSubmittedByComplaintId(trimmed)
    if (localMatch) {
      setResult(localMatch)
      setIsLoading(false)
      return
    }

    try {
      const remote = await lookupComplaint(trimmed)
      if (!remote) {
        setErrorMessage('No complaint found for that ID.')
      } else {
        setResult(remote)
      }
    } catch {
      setErrorMessage('Unable to look up that complaint. Try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Track Complaint</CardTitle>
        <CardDescription>Look up status using your complaint ID (e.g. RW-2026-1043).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={handleLookup}>
          <div className="min-w-0 flex-1 space-y-2">
            <Label htmlFor="track-complaint-id">Complaint ID</Label>
            <Input
              id="track-complaint-id"
              value={complaintId}
              onChange={(event) => setComplaintId(event.target.value)}
              placeholder="RW-2026-1043"
              autoComplete="off"
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Looking up…' : 'Track'}
          </Button>
        </form>

        {errorMessage ? (
          <p className="text-sm text-[var(--rw-danger)]" role="alert">
            {errorMessage}
          </p>
        ) : null}

        {result ? (
          <dl className="grid gap-3 rounded-lg border border-[var(--rw-border)] p-4 text-sm sm:grid-cols-2">
            {[
              { label: 'Status', value: result.status },
              { label: 'Authority', value: result.authority },
              { label: 'Department', value: result.department },
              { label: 'Last Updated', value: result.lastUpdated },
            ].map((row) => (
              <div key={row.label}>
                <dt className="text-xs font-medium uppercase tracking-wide text-[var(--rw-text-tertiary)]">
                  {row.label}
                </dt>
                <dd className="mt-1 font-medium text-[var(--rw-text-primary)]">{row.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </CardContent>
    </Card>
  )
}
