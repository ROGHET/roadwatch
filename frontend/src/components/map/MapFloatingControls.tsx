import { Filter, Loader2, LocateFixed, Plus, Search, X } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { useId, type FormEvent } from 'react'
import { twMerge } from 'tailwind-merge'
import { Button } from '../common/Button'
import type { MapLayerFilter } from '../../lib/map/constants'
import type { GeolocationStatus } from '../../hooks/useGeolocation'
import { fadeInUp, scaleIn } from '../../lib/motion'
import { routes } from '../../lib/routes'

const filterOptions: { value: MapLayerFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'roads', label: 'Roads' },
  { value: 'complaints', label: 'Complaints' },
]

export type MapSearchResult = {
  id: string
  label: string
  description: string
  kind: 'road' | 'complaint'
  lat: number
  lng: number
}

export type MapFloatingControlsProps = {
  mode: 'preview' | 'expanded'
  searchQuery: string
  onSearchQueryChange: (value: string) => void
  searchResults: MapSearchResult[]
  onSearchResultSelect: (result: MapSearchResult) => void
  filter: MapLayerFilter
  onFilterChange: (filter: MapLayerFilter) => void
  filterOpen: boolean
  onFilterOpenChange: (open: boolean) => void
  onLocate: () => void
  locateStatus: GeolocationStatus
  locateMessage?: string | null
  className?: string
}

export function MapFloatingControls({
  mode,
  searchQuery,
  onSearchQueryChange,
  searchResults,
  onSearchResultSelect,
  filter,
  onFilterChange,
  filterOpen,
  onFilterOpenChange,
  onLocate,
  locateStatus,
  locateMessage,
  className,
}: MapFloatingControlsProps) {
  const prefersReducedMotion = useReducedMotion()
  const searchId = useId()
  const showResults = searchQuery.trim().length > 0 && mode === 'expanded'
  const controlsEnabled = mode === 'expanded'

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (searchResults[0]) {
      onSearchResultSelect(searchResults[0])
    }
  }

  if (!controlsEnabled) {
    return null
  }

  return (
    <div
      className={twMerge(
        'pointer-events-none absolute inset-x-0 top-0 z-[500] flex flex-col gap-3 p-3 sm:p-4',
        className,
      )}
    >
      <motion.form
        className="pointer-events-auto rw-map-glass mx-auto flex w-full max-w-xl items-center gap-2 rounded-full px-3 py-2 shadow-lg"
        onSubmit={handleSearchSubmit}
        variants={prefersReducedMotion ? undefined : fadeInUp}
        initial={prefersReducedMotion ? false : 'hidden'}
        animate={prefersReducedMotion ? undefined : 'visible'}
        role="search"
        aria-label="Search roads and complaints"
      >
        <Search className="size-5 shrink-0 text-[var(--rw-text-tertiary)]" aria-hidden="true" />
        <label htmlFor={searchId} className="sr-only">
          Search roads and complaints
        </label>
        <input
          id={searchId}
          type="search"
          value={searchQuery}
          onChange={(event) => onSearchQueryChange(event.target.value)}
          placeholder="Search roads or complaints"
          className="min-w-0 flex-1 bg-transparent text-sm text-[var(--rw-text-primary)] outline-none placeholder:text-[var(--rw-text-tertiary)]"
          autoComplete="off"
        />
        {searchQuery ? (
          <button
            type="button"
            onClick={() => onSearchQueryChange('')}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-[var(--rw-text-secondary)] transition-colors hover:bg-[var(--rw-surface-muted)] hover:text-[var(--rw-text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rw-ring)]"
            aria-label="Clear search"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        ) : null}
      </motion.form>

      {showResults ? (
        <motion.ul
          className="pointer-events-auto rw-map-glass mx-auto max-h-52 w-full max-w-xl overflow-y-auto rounded-2xl p-2 shadow-lg"
          role="listbox"
          aria-label="Search results"
          variants={prefersReducedMotion ? undefined : fadeInUp}
          initial={prefersReducedMotion ? false : 'hidden'}
          animate={prefersReducedMotion ? undefined : 'visible'}
        >
          {searchResults.length === 0 ? (
            <li className="px-3 py-4 text-center text-sm text-[var(--rw-text-secondary)]">
              No matching records found.
            </li>
          ) : (
            searchResults.map((result) => (
              <li key={`${result.kind}-${result.id}`} role="option">
                <button
                  type="button"
                  onClick={() => onSearchResultSelect(result)}
                  className="flex w-full flex-col gap-0.5 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-[var(--rw-surface-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rw-ring)]"
                >
                  <span className="text-sm font-medium text-[var(--rw-text-primary)]">
                    {result.label}
                  </span>
                  <span className="text-xs text-[var(--rw-text-secondary)]">
                    {result.description}
                  </span>
                </button>
              </li>
            ))
          )}
        </motion.ul>
      ) : null}

      <div className="pointer-events-none flex items-start justify-between gap-3">
        <div className="pointer-events-auto relative">
          <motion.button
            type="button"
            onClick={() => onFilterOpenChange(!filterOpen)}
            className="rw-map-glass inline-flex size-11 items-center justify-center rounded-full shadow-lg transition-colors hover:bg-[var(--rw-surface-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rw-ring)]"
            aria-expanded={filterOpen}
            aria-controls="map-layer-filters"
            aria-label="Map layer filters"
            variants={prefersReducedMotion ? undefined : scaleIn}
            initial={prefersReducedMotion ? false : 'hidden'}
            animate={prefersReducedMotion ? undefined : 'visible'}
          >
            <Filter className="size-5 text-[var(--rw-text-primary)]" aria-hidden="true" />
          </motion.button>

          {filterOpen ? (
            <motion.div
              id="map-layer-filters"
              className="rw-map-glass absolute left-0 top-full z-10 mt-2 min-w-44 rounded-2xl p-2 shadow-lg"
              role="group"
              aria-label="Layer filters"
              variants={prefersReducedMotion ? undefined : fadeInUp}
              initial={prefersReducedMotion ? false : 'hidden'}
              animate={prefersReducedMotion ? undefined : 'visible'}
            >
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onFilterChange(option.value)
                    onFilterOpenChange(false)
                  }}
                  className={twMerge(
                    'flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rw-ring)]',
                    filter === option.value
                      ? 'bg-[var(--rw-primary)] font-medium text-[var(--rw-primary-foreground)]'
                      : 'text-[var(--rw-text-primary)] hover:bg-[var(--rw-surface-muted)]',
                  )}
                  aria-pressed={filter === option.value}
                >
                  {option.label}
                </button>
              ))}
            </motion.div>
          ) : null}
        </div>

        <div className="pointer-events-auto flex flex-col items-end gap-2">
          <motion.button
            type="button"
            onClick={onLocate}
            disabled={locateStatus === 'loading'}
            className="rw-map-glass inline-flex size-11 items-center justify-center rounded-full shadow-lg transition-colors hover:bg-[var(--rw-surface-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rw-ring)] disabled:cursor-wait disabled:opacity-70"
            aria-label={
              locateStatus === 'loading' ? 'Locating your position' : 'Locate me on the map'
            }
            aria-busy={locateStatus === 'loading'}
            variants={prefersReducedMotion ? undefined : scaleIn}
            initial={prefersReducedMotion ? false : 'hidden'}
            animate={prefersReducedMotion ? undefined : 'visible'}
          >
            {locateStatus === 'loading' ? (
              <Loader2 className="size-5 animate-spin text-[var(--rw-primary)]" aria-hidden="true" />
            ) : (
              <LocateFixed className="size-5 text-[var(--rw-text-primary)]" aria-hidden="true" />
            )}
          </motion.button>

          <Button
            type="button"
            to={routes.complaint}
            className="rounded-full px-4 shadow-lg"
            aria-label="Report a road issue"
          >
            <Plus className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Report Issue</span>
            <span className="sm:hidden">Report</span>
          </Button>
        </div>
      </div>

      {locateMessage ? (
        <p
          className={twMerge(
            'pointer-events-auto rw-map-glass mx-auto max-w-xl rounded-xl px-3 py-2 text-center text-xs shadow-md',
            locateStatus === 'denied'
              ? 'text-[var(--rw-danger)]'
              : 'text-[var(--rw-text-secondary)]',
          )}
          role="alert"
        >
          {locateMessage}
        </p>
      ) : null}
    </div>
  )
}
