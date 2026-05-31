import { useEffect } from 'react'
import { fetchComplaints } from '../lib/api/complaints'
import {
  loadInfrastructureCatalog,
  mergeComplaintsWithCatalog,
} from '../lib/complaints/unifiedComplaints'
import { buildStoredSubmittedComplaint, useComplaintStore } from '../stores/complaintStore'

let hydratePromise: Promise<void> | null = null

function scheduleCatalogMerge(
  getSubmitted: () => ReturnType<typeof buildStoredSubmittedComplaint>[],
  setSubmittedComplaints: (complaints: ReturnType<typeof buildStoredSubmittedComplaint>[]) => void,
) {
  const run = () => {
    void loadInfrastructureCatalog().then(() => {
      setSubmittedComplaints(mergeComplaintsWithCatalog(getSubmitted()))
    })
  }
  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(run, { timeout: 4000 })
  } else {
    window.setTimeout(run, 1500)
  }
}

async function hydrateComplaintsOnce(
  getSubmitted: () => ReturnType<typeof buildStoredSubmittedComplaint>[],
  setSubmittedComplaints: (complaints: ReturnType<typeof buildStoredSubmittedComplaint>[]) => void,
) {
  if (!hydratePromise) {
    hydratePromise = (async () => {
      try {
        const complaints = await fetchComplaints()
        if (complaints.length > 0) {
          const fromApi = complaints.map((complaint) => buildStoredSubmittedComplaint(complaint))
          setSubmittedComplaints(fromApi)
          scheduleCatalogMerge(getSubmitted, setSubmittedComplaints)
          return
        }
      } catch {
        // Fall through to idle catalog seed.
      }
      scheduleCatalogMerge(getSubmitted, setSubmittedComplaints)
    })()
  }
  await hydratePromise
}

/** Loads API complaints and CSV catalog once per session (catalog in async chunk). */
export function useHydrateComplaints() {
  const setSubmittedComplaints = useComplaintStore((state) => state.setSubmittedComplaints)

  useEffect(() => {
    void hydrateComplaintsOnce(
      () => useComplaintStore.getState().submittedComplaints,
      setSubmittedComplaints,
    )
  }, [setSubmittedComplaints])
}
