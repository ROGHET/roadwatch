import { INDIAN_STATES } from '../../data/indianStates'

const STATE_ALIASES: Record<string, string> = {
  'nct of delhi': 'Delhi',
  'national capital territory of delhi': 'Delhi',
  'orissa': 'Odisha',
  'pondicherry': 'Puducherry',
  'uttaranchal': 'Uttarakhand',
  'jammu & kashmir': 'Jammu and Kashmir',
  'dadra and nagar haveli': 'Dadra and Nagar Haveli and Daman and Diu',
  'daman and diu': 'Dadra and Nagar Haveli and Daman and Diu',
}

function normalizeStateName(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const lower = trimmed.toLowerCase()
  if (STATE_ALIASES[lower]) return STATE_ALIASES[lower]
  const exact = INDIAN_STATES.find((state) => state.toLowerCase() === lower)
  if (exact) return exact
  const partial = INDIAN_STATES.find(
    (state) => lower.includes(state.toLowerCase()) || state.toLowerCase().includes(lower),
  )
  return partial ?? trimmed
}

function matchStateInText(text: string): string | null {
  const lower = text.toLowerCase()
  for (const state of INDIAN_STATES) {
    if (lower.includes(state.toLowerCase())) {
      return state
    }
  }
  return null
}

export type TollStateSource = {
  state?: string | null
  state_name?: string | null
  plaza_state?: string | null
  location?: string | null
  address?: string | null
  name?: string | null
}

/** Resolve toll plaza state; returns null if unknown (exclude from state charts). */
export function extractTollState(source: TollStateSource): string | null {
  const candidates = [
    source.state,
    source.state_name,
    source.plaza_state,
    source.location,
    source.address,
    source.name,
  ]

  for (const candidate of candidates) {
    if (!candidate?.trim()) continue
    const normalized = normalizeStateName(candidate)
    if (normalized && INDIAN_STATES.includes(normalized as (typeof INDIAN_STATES)[number])) {
      return normalized
    }
    const fromText = matchStateInText(candidate)
    if (fromText) return fromText
  }

  return null
}
