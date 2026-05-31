import type { StoredSubmittedComplaint } from '../../stores/complaintStore'

let catalogCache: StoredSubmittedComplaint[] = []
let catalogLoadPromise: Promise<StoredSubmittedComplaint[]> | null = null

let lastSubmittedRef: StoredSubmittedComplaint[] | null = null
let lastMerged: StoredSubmittedComplaint[] | null = null

export function getInfrastructureCatalog(): StoredSubmittedComplaint[] {
  return catalogCache
}

export function isInfrastructureCatalogLoaded(): boolean {
  return catalogCache.length > 0
}

/** Loads Rajya Sabha / Gujarat CSV catalog in a separate async chunk. */
export function loadInfrastructureCatalog(): Promise<StoredSubmittedComplaint[]> {
  if (catalogCache.length > 0) {
    return Promise.resolve(catalogCache)
  }
  if (!catalogLoadPromise) {
    catalogLoadPromise = import('./infrastructureCatalogBuilder').then((module) => {
      catalogCache = module.buildInfrastructureCatalog()
      lastSubmittedRef = null
      lastMerged = null
      return catalogCache
    })
  }
  return catalogLoadPromise
}

/** Merges API/user submissions with infrastructure catalog (deduped by marker id). */
export function mergeComplaintsWithCatalog(
  submittedComplaints: StoredSubmittedComplaint[],
): StoredSubmittedComplaint[] {
  if (submittedComplaints === lastSubmittedRef && lastMerged) {
    return lastMerged
  }

  const merged = new Map<string, StoredSubmittedComplaint>()
  for (const entry of catalogCache) {
    merged.set(entry.marker.id, entry)
  }
  for (const entry of submittedComplaints) {
    merged.set(entry.marker.id, entry)
  }
  const result = Array.from(merged.values())
  lastSubmittedRef = submittedComplaints
  lastMerged = result
  return result
}

export function invalidateMergedComplaintsCache(): void {
  lastSubmittedRef = null
  lastMerged = null
}
