import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PageContainer } from '../../components/common/PageContainer'
import { SectionHeader } from '../../components/common/SectionHeader'
import { Input } from '../../components/common/Input'
import { Select } from '../../components/common/Select'
import { ComplaintListSection } from '../../components/complaints/ComplaintListSection'
import { routes } from '../../lib/routes'
import { selectComplaintHistoryItems } from '../../lib/complaints/mergedComplaints'
import { useComplaintStore } from '../../stores/complaintStore'

const statusOptions = ['all', 'pending', 'routed', 'in_review', 'resolved', 'rejected'] as const
const severityOptions = ['all', 'low', 'medium', 'high', 'critical'] as const
const sortOptions = ['newest', 'oldest'] as const

export default function ComplaintHistoryPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const submittedComplaints = useComplaintStore((state) => state.submittedComplaints)
  const [search, setSearch] = useState(searchParams.get('q') ?? '')

  const status = statusOptions.includes(searchParams.get('status') as (typeof statusOptions)[number])
    ? searchParams.get('status') ?? 'all'
    : 'all'
  const issueType = searchParams.get('issueType') ?? 'all'
  const severity = severityOptions.includes(searchParams.get('severity') as (typeof severityOptions)[number])
    ? searchParams.get('severity') ?? 'all'
    : 'all'
  const sort = sortOptions.includes(searchParams.get('sort') as (typeof sortOptions)[number])
    ? searchParams.get('sort') ?? 'newest'
    : 'newest'

  const issueTypes = useMemo(
    () =>
      Array.from(
        new Set(
          submittedComplaints
            .map((entry) => entry.marker.issueType)
            .filter((value): value is string => Boolean(value)),
        ),
      ).sort(),
    [submittedComplaints],
  )

  const items = useMemo(
    () =>
      selectComplaintHistoryItems(submittedComplaints, {
        status,
        issueType,
        severity,
        search,
        sort: sort as 'newest' | 'oldest',
      }),
    [issueType, search, severity, sort, status, submittedComplaints],
  )

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams)
    if (!value || value === 'all' || (key === 'sort' && value === 'newest')) {
      next.delete(key)
    } else {
      next.set(key, value)
    }
    setSearchParams(next)
  }

  return (
    <PageContainer className="gap-6">
      <SectionHeader
        title="Complaint History"
        description="Search, filter, and open real complaint records from the connected database."
      />

      <div className="grid gap-3 rounded-2xl border border-[var(--rw-border)] bg-[var(--rw-surface)]/80 p-4 backdrop-blur-xl md:grid-cols-5">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onBlur={() => updateParam('q', search)}
          placeholder="Search complaints"
          className="md:col-span-2"
        />
        <Select value={status} onChange={(event) => updateParam('status', event.target.value)}>
          {statusOptions.map((option) => (
            <option key={option} value={option}>
              {option === 'all' ? 'All statuses' : option.replace(/_/g, ' ')}
            </option>
          ))}
        </Select>
        <Select value={issueType} onChange={(event) => updateParam('issueType', event.target.value)}>
          <option value="all">All issue types</option>
          {issueTypes.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
        <Select value={severity} onChange={(event) => updateParam('severity', event.target.value)}>
          {severityOptions.map((option) => (
            <option key={option} value={option}>
              {option === 'all' ? 'All severities' : option}
            </option>
          ))}
        </Select>
        <Select value={sort} onChange={(event) => updateParam('sort', event.target.value)}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </Select>
      </div>

      <ComplaintListSection
        title="Complaints"
        description={`${items.length.toLocaleString('en-IN')} matching records`}
        items={items}
        onItemClick={(item) => navigate(routes.complaintDetail(item.id))}
        emptyTitle="No matching complaints"
        emptyDescription="No complaint records match the current filters."
      />
    </PageContainer>
  )
}
