import { Filter, Loader2, LocateFixed, Plus, Search, X } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { useCallback, useEffect, useId, useRef, type FormEvent, type MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { twMerge } from 'tailwind-merge'
import { Button } from '../common/Button'
import type { GeolocationStatus } from '../../hooks/useGeolocation'
import { fadeInUp, scaleIn } from '../../lib/motion'
import { routes } from '../../lib/routes'
import { useMapStore } from '../../stores/mapStore'
import { useI18n } from '../../lib/i18n'

export type MapSearchResult = {
  id: string
  label: string
  description: string
  kind: 'road' | 'complaint' | 'place' | 'toll' | 'contractor' | 'state' | 'district'
  lat: number
  lng: number
}

export type MapFloatingControlsProps = {
  mode: 'preview' | 'expanded'
  searchQuery: string
  onSearchQueryChange: (value: string) => void
  searchResults: MapSearchResult[]
  searchLoading?: boolean
  onSearchResultSelect: (result: MapSearchResult) => void
  onSearchClose?: () => void
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
  searchLoading = false,
  onSearchResultSelect,
  onSearchClose,
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
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const showResults = mode === 'expanded' && searchQuery.trim().length >= 2
  const controlsEnabled = mode === 'expanded'
  const locating = locateStatus === 'loading' || locateStatus === 'refreshing'

  const closeSearch = useCallback(() => {
    onSearchQueryChange('')
    onSearchClose?.()
    inputRef.current?.blur()
  }, [onSearchClose, onSearchQueryChange])

  const handleClosePointer = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault()
      event.stopPropagation()
      closeSearch()
    },
    [closeSearch],
  )

  useEffect(() => {
    if (!showResults) return
    function handleClick(event: globalThis.MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeSearch()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [closeSearch, showResults])

  useEffect(() => {
    if (!showResults) return
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeSearch()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [closeSearch, showResults])

  const openLocationHelp = () => {
    const ua = navigator.userAgent.toLowerCase()
    const helpUrl = ua.includes('edg')
      ? 'https://support.microsoft.com/en-us/microsoft-edge/allow-or-block-site-permissions-in-microsoft-edge-17c6fdb8-3322-4d96-9027-4c8f0b8d8a8a'
      : ua.includes('safari') && !ua.includes('chrome')
        ? 'https://support.apple.com/guide/safari/websites-ibrw8ee48344/mac'
        : ua.includes('firefox')
          ? 'https://support.mozilla.org/en-US/kb/how-manage-your-location-permissions-firefox'
          : 'https://support.google.com/chrome/answer/142065'

    window.open(helpUrl, '_blank', 'noopener,noreferrer')
  }

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (searchResults[0]) {
      onSearchResultSelect(searchResults[0])
      closeSearch()
    }
  }

  const handleResultSelect = (result: MapSearchResult) => {
    onSearchResultSelect(result)
    closeSearch()
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
      <div ref={dropdownRef} className="pointer-events-auto mx-auto w-full max-w-[520px]">
        <motion.form
          className="rw-map-glass flex items-center gap-3 rounded-full px-[var(--st-gutter)] py-[var(--st-stack-sm)] shadow-[var(--st-shadow-glass)]"
          onSubmit={handleSearchSubmit}
          variants={prefersReducedMotion ? undefined : fadeInUp}
          initial={prefersReducedMotion ? false : 'hidden'}
          animate={prefersReducedMotion ? undefined : 'visible'}
          role="search"
          aria-label={t('searchPlaces')}
        >
          <Search className="size-5 shrink-0 text-[var(--st-primary)]" aria-hidden="true" />
          <span className="hidden font-serif text-lg text-[var(--st-primary)] sm:inline">{t('appName')}</span>
          <label htmlFor={searchId} className="sr-only">
            {t('searchPlaces')}
          </label>
          <input
            ref={inputRef}
            id={searchId}
            type="text"
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            placeholder={t('searchPlaces')}
            className="min-w-0 flex-1 bg-transparent text-sm text-[var(--rw-text-primary)] outline-none placeholder:text-[var(--rw-text-tertiary)]"
            autoComplete="off"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={handleClosePointer}
              onMouseDown={(event) => event.stopPropagation()}
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-[var(--rw-text-secondary)] transition-[background-color,color,transform] duration-200 hover:bg-[var(--rw-surface-muted)] hover:text-[var(--rw-text-primary)] active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rw-ring)]"
              aria-label={t('clearSearch')}
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          ) : null}
        </motion.form>

        {showResults ? (
          <motion.div
            className="mt-2"
            variants={prefersReducedMotion ? undefined : fadeInUp}
            initial={prefersReducedMotion ? false : 'hidden'}
            animate={prefersReducedMotion ? undefined : 'visible'}
          >
            <ul
              className="rw-map-glass max-h-52 w-full overflow-y-auto rounded-[1.25rem] p-2 shadow-[0_20px_60px_-24px_rgb(0_0_0/0.45)] backdrop-blur-2xl"
              role="listbox"
              aria-label={t('searchResults')}
            >
              <li className="px-3 py-1">
                <span className="text-xs font-medium uppercase tracking-wide text-[var(--rw-text-tertiary)]">
                  {t('searchResults')}
                </span>
              </li>
              {searchLoading ? (
                <li className="flex items-center justify-center gap-2 px-3 py-4 text-sm text-[var(--rw-text-secondary)]">
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  {t('searchingPlaces')}
                </li>
              ) : searchResults.length === 0 ? (
                <li className="px-3 py-4 text-center text-sm text-[var(--rw-text-secondary)]">
                  {t('noMatchingRecords')}
                </li>
              ) : (
                searchResults.map((result) => (
                  <li key={`${result.kind}-${result.id}`} role="option">
                    <button
                      type="button"
                      onClick={() => handleResultSelect(result)}
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
            </ul>
          </motion.div>
        ) : null}
      </div>

      <div className="pointer-events-none flex items-start justify-between gap-3">
        <div className="pointer-events-auto relative">
          <motion.button
            type="button"
            onClick={() => onFilterOpenChange(!filterOpen)}
            className="rw-map-glass inline-flex h-[var(--rw-input-height)] w-[var(--rw-input-height)] items-center justify-center rounded-full shadow-[0_18px_50px_-22px_rgb(0_0_0/0.45)] transition-[background-color,transform] duration-200 hover:bg-[var(--rw-surface-muted)] active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rw-ring)]"
            aria-expanded={filterOpen}
            aria-controls="map-layer-filters"
            aria-label={t('filterPanelTitle')}
            variants={prefersReducedMotion ? undefined : scaleIn}
            initial={prefersReducedMotion ? false : 'hidden'}
            animate={prefersReducedMotion ? undefined : 'visible'}
            whileHover={prefersReducedMotion ? undefined : { y: -1, scale: 1.02 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
          >
            <Filter className="size-5 text-[var(--rw-text-primary)]" aria-hidden="true" />
          </motion.button>
        </div>

        {/* Top-right controls: Recenter, then Report Issue */}
        <div className="pointer-events-auto flex flex-col items-end gap-2">
          <motion.button
            type="button"
            onClick={onLocate}
            disabled={locating}
            className="rw-map-glass inline-flex h-[var(--rw-input-height)] w-[var(--rw-input-height)] items-center justify-center rounded-full shadow-[0_18px_50px_-22px_rgb(0_0_0/0.45)] transition-[background-color,transform] duration-200 hover:bg-[var(--rw-surface-muted)] active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rw-ring)] disabled:cursor-wait disabled:opacity-70"
            aria-label={
              locating ? t('locatingPosition') : t('locateMe')
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
            className="rounded-full bg-[var(--rw-danger)] px-4 text-[var(--rw-danger-foreground)] shadow-[var(--st-shadow-fab)] transition-[background-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-[color-mix(in_srgb,var(--rw-danger)_84%,black)] hover:shadow-[0_16px_36px_-14px_rgb(127_29_29/0.5)] active:scale-95"
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
                ? t('locationRequiresHttps')
                : locateStatus === 'denied' || locatePermissionState === 'denied'
                  ? t('locationAccessDisabled')
                  : locateStatus === 'unavailable'
                  ? locateMessage || t('locationUnavailable')
                  : locateMessage || t('enableLocationForBetter')}
            </p>
            <p className="mt-1 text-xs leading-5 text-[var(--rw-text-secondary)]">
              {t('locationAccessImproves')}
            </p>
          </div>
          {locateStatus !== 'loading' && locatePolicyBlockReason !== 'insecure-private-origin' ? (
            locateStatus === 'denied' || locatePermissionState === 'denied' ? (
              <Button
                type="button"
                className="shrink-0 rounded-full bg-[var(--st-primary-container)] px-4 text-[var(--st-on-primary-container)] shadow-[var(--st-shadow-fab)] hover:brightness-110"
                onClick={openLocationHelp}
              >
                {t('howToEnable')}
              </Button>
            ) : (
              <Button
                type="button"
                className="shrink-0 rounded-full bg-[var(--st-primary-container)] px-4 text-[var(--st-on-primary-container)] shadow-[var(--st-shadow-fab)] hover:brightness-110"
                onClick={onLocate}
              >
                {locateStatus === 'unavailable' ? t('tryAgain') : t('enableLocation')}
              </Button>
            )
          ) : null}
        </motion.div>
      ) : null}
    </div>
  )
}
