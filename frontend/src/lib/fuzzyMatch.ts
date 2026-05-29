/**
 * Lightweight fuzzy match for local command palette search (no external APIs).
 */
export function fuzzyScore(query: string, target: string): number {
  const q = query.trim().toLowerCase()
  const t = target.toLowerCase()

  if (!q) return 1
  if (t === q) return 200
  if (t.startsWith(q)) return 150
  if (t.includes(q)) return 120

  let queryIndex = 0
  let score = 0
  let lastMatchIndex = -1

  for (let i = 0; i < t.length && queryIndex < q.length; i++) {
    if (t[i] === q[queryIndex]) {
      score += lastMatchIndex === i - 1 ? 12 : 6
      if (i === 0 || t[i - 1] === ' ') score += 4
      lastMatchIndex = i
      queryIndex++
    }
  }

  if (queryIndex !== q.length) return 0

  return 40 + score
}

export function rankByFuzzyQuery<T>(
  items: T[],
  query: string,
  getSearchText: (item: T) => string,
): T[] {
  if (!query.trim()) return items

  return items
    .map((item) => ({ item, score: fuzzyScore(query, getSearchText(item)) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.item)
}
