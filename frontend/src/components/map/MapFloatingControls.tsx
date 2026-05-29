import { Filter, Loader2, LocateFixed, Plus, Search, X } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { useId, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { twMerge } from 'tailwind-merge'
import { Button } from '../common/Button'
import type { MapLayerFilter } from '../../lib/map/constants'
import type { GeolocationStatus } from '../../hooks/useGeolocation'
import { fadeInUp, scaleIn } from '../../lib/motion'
import { routes } from '../../lib/routes'
import { useMapStore } from '../../stores/mapStore'
import { useI18n } from '../../lib/i18n'

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
  locatePermissionState?: PermissionState | 'unsupported' | null
  locatePolicyBlockReason?: 'insecure-private-origin' | null
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
  locatePermissionState,
  locatePolicyBlockReason,
  className,
}: MapFloatingControlsProps) {
  const navigate = useNavigate()
  const { t } = useI18n()
  const persistForNavigation = useMapStore((state) => state.persistForNavigation)
  const prefersReducedMotion = useReducedMotion()
  const searchId = useId()
  const showResults = searchQuery.trim().length > 0 && mode === 'expanded'
  const controlsEnabled = mode === 'expanded'
  const locating = locateStatus === 'loading' || locateStatus === 'refreshing'

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
        className="pointer-events-auto rw-map-glass mx-auto flex w-full max-w-[520px] items-center gap-3 rounded-full px-[var(--st-gutter)] py-[var(--st-stack-sm)] shadow-[var(--st-shadow-glass)]"
        onSubmit={handleSearchSubmit}
        variants={prefersReducedMotion ? undefined : fadeInUp}
        initial={prefersReducedMotion ? false : 'hidden'}
        animate={prefersReducedMotion ? undefined : 'visible'}
        role="search"
        aria-label="Search roads and complaints"
      >
        <Search className="size-5 shrink-0 text-[var(--st-primary)]" aria-hidden="true" />
        <span className="hidden font-serif text-lg text-[var(--st-primary)] sm:inline">{t('appName')}</span>
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
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-[var(--rw-text-secondary)] transition-[background-color,color,transform] duration-200 hover:bg-[var(--rw-surface-muted)] hover:text-[var(--rw-text-primary)] active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rw-ring)]"
            aria-label="Clear search"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        ) : null}
      </motion.form>

      {showResults ? (
        <motion.ul
          className="pointer-events-auto rw-map-glass mx-auto max-h-52 w-full max-w-xl overflow-y-auto rounded-[1.25rem] p-2 shadow-[0_20px_60px_-24px_rgb(0_0_0/0.45)] backdrop-blur-2xl"
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
                  className="flex w-full flex-col gap-0.5 rounded-xl px-3 py-2.5 text-left transition-[background-color,transform] duration-200 hover:bg-[var(--rw-surface-muted)] active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rw-ring)]"
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
            className="rw-map-glass inline-flex h-[var(--rw-input-height)] w-[var(--rw-input-height)] items-center justify-center rounded-full shadow-[0_18px_50px_-22px_rgb(0_0_0/0.45)] transition-[background-color,transform] duration-200 hover:bg-[var(--rw-surface-muted)] active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rw-ring)]"
            aria-expanded={filterOpen}
            aria-controls="map-layer-filters"
            aria-label="Map layer filters"
            variants={prefersReducedMotion ? undefined : scaleIn}
            initial={prefersReducedMotion ? false : 'hidden'}
            animate={prefersReducedMotion ? undefined : 'visible'}
            whileHover={prefersReducedMotion ? undefined : { y: -1, scale: 1.02 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
          >
            <Filter className="size-5 text-[var(--rw-text-primary)]" aria-hidden="true" />
          </motion.button>

          {filterOpen ? (
            <motion.div
              id="map-layer-filters"
              className="rw-map-glass absolute left-0 top-full z-10 mt-2 min-w-44 rounded-[1.25rem] p-2 shadow-[0_18px_50px_-22px_rgb(0_0_0/0.45)] backdrop-blur-2xl"
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
                    'flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition-[background-color,transform] duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rw-ring)]',
                    filter === option.value
                      ? 'bg-[var(--rw-primary)] font-medium text-[var(--rw-primary-foreground)]'
                      : 'text-[var(--rw-text-primary)] hover:bg-[var(--rw-surface-muted)] active:scale-[0.99]',
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
            disabled={locating}
            className="rw-map-glass inline-flex h-[var(--rw-input-height)] w-[var(--rw-input-height)] items-center justify-center rounded-full shadow-[0_18px_50px_-22px_rgb(0_0_0/0.45)] transition-[background-color,transform] duration-200 hover:bg-[var(--rw-surface-muted)] active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rw-ring)] disabled:cursor-wait disabled:opacity-70"
            aria-label={
              locating ? 'Locating your position' : 'Locate me on the map'
            }
            aria-busy={locating}
            variants={prefersReducedMotion ? undefined : scaleIn}
            initial={prefersReducedMotion ? false : 'hidden'}
            animate={prefersReducedMotion ? undefined : 'visible'}
            whileHover={prefersReducedMotion ? undefined : { y: -1, scale: 1.02 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
          >
            {locating ? (
              <Loader2 className="size-5 animate-spin text-[var(--rw-primary)]" aria-hidden="true" />
            ) : (
              <LocateFixed className="size-5 text-[var(--rw-text-primary)]" aria-hidden="true" />
            )}
          </motion.button>

          <Button
            type="button"
            className="rounded-full bg-[var(--rw-danger)] px-4 text-white shadow-[var(--st-shadow-fab)] hover:brightness-110"
            aria-label="Report a road issue"
            onClick={() => {
              persistForNavigation()
              navigate(routes.complaint)
            }}
          >
            <Plus className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">{t('reportIssue')}</span>
            <span className="sm:hidden">{t('quickReport')}</span>
          </Button>
        </div>
      </div>

      {(locateStatus === 'idle' || locateStatus === 'denied' || locateStatus === 'unavailable' || locateMessage) ? (
        <motion.div
          className="pointer-events-auto rw-map-glass mx-auto mt-auto mb-4 flex w-full max-w-sm flex-col gap-3 rounded-2xl p-4 shadow-[var(--st-shadow-glass)] sm:max-w-md sm:flex-row sm:items-center sm:justify-between"
          variants={prefersReducedMotion ? undefined : fadeInUp}
          initial={prefersReducedMotion ? false : 'hidden'}
          animate={prefersReducedMotion ? undefined : 'visible'}
        >
          <div className="text-center sm:text-left">
            <p className="text-sm font-medium text-[var(--rw-text-primary)]">
              {locatePolicyBlockReason === 'insecure-private-origin'
                ? 'Location requires HTTPS or localhost on this browser.'
                : locateStatus === 'denied' || locatePermissionState === 'denied'
                  ? 'Location access is disabled in your browser.'
                  : locateStatus === 'unavailable'
                  ? locateMessage || 'Location is unavailable right now.'
                  : locateMessage || 'Enable location for a better map experience.'}
            </p>
            <p className="mt-1 text-xs leading-5 text-[var(--rw-text-secondary)]">
              Location access improves routing, nearby issues, and local intelligence.
            </p>
          </div>
          {locateStatus !== 'loading' && locatePolicyBlockReason !== 'insecure-private-origin' ? (
            locateStatus === 'denied' || locatePermissionState === 'denied' ? (
              <Button
                type="button"
                className="shrink-0 rounded-full bg-[var(--st-primary-container)] px-4 text-[var(--st-on-primary-container)] shadow-[var(--st-shadow-fab)] hover:brightness-110"
                onClick={() => window.open('https://support.google.com/chrome/answer/142065', '_blank', 'noopener,noreferrer')}
              >
                How to Enable
              </Button>
            ) : (
              <Button
                type="button"
                className="shrink-0 rounded-full bg-[var(--st-primary-container)] px-4 text-[var(--st-on-primary-container)] shadow-[var(--st-shadow-fab)] hover:brightness-110"
                onClick={onLocate}
              >
                {locateStatus === 'unavailable' ? 'Try Again' : 'Enable Location'}
              </Button>
            )
          ) : null}
        </motion.div>
      ) : null}
    </div>
  )
}
