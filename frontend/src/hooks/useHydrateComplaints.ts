import { useEffect } from 'react'
import { fetchComplaints } from '../lib/api/complaints'
import { ensureComplaintCatalog } from '../lib/complaints/complaintSelectors'
import { buildStoredSubmittedComplaint, useComplaintStore } from '../stores/complaintStore'

let hydratePromise: Promise<void> | null = null

async function hydrateComplaintsOnce(
  getSubmitted: () => ReturnType<typeof buildStoredSubmittedComplaint>[],
  setSubmittedComplaints: (complaints: ReturnType<typeof buildStoredSubmittedComplaint>[]) => void,
) {
  if (!hydratePromise) {
    hydratePromise = (async () => {
      try {
        const complaints = await fetchComplaints()
        if (complaints.length > 0) {
          setSubmittedComplaints(
            complaints.map((complaint) => buildStoredSubmittedComplaint(complaint)),
          )
          return
        }
      } catch {
        // Fall through to catalog seed.
      }
      ensureComplaintCatalog(getSubmitted(), setSubmittedComplaints)
    })()
  }
  await hydratePromise
}

/** Loads API complaints once per session without wiping mock/persisted data on empty responses. */
export function useHydrateComplaints() {
  const submittedComplaints = useComplaintStore((state) => state.submittedComplaints)
  const setSubmittedComplaints = useComplaintStore((state) => state.setSubmittedComplaints)

  useEffect(() => {
    void hydrateComplaintsOnce(
      () => useComplaintStore.getState().submittedComplaints,
      setSubmittedComplaints,
    )
  }, [setSubmittedComplaints])

  useEffect(() => {
    if (submittedComplaints.length === 0) {
      ensureComplaintCatalog(submittedComplaints, setSubmittedComplaints)
    }
  }, [submittedComplaints, setSubmittedComplaints])
}
