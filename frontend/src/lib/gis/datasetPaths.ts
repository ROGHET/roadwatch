/** Base URL for datasets served by Vite dev middleware and production static copy. */
export const DATASETS_BASE = '/datasets'

export function datasetUrl(filename: string) {
  return `${DATASETS_BASE}/${filename}`
}
