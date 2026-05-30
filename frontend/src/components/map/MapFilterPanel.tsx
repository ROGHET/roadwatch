import type { ComplaintSeverity } from '../complaints/ComplaintCard'
import { Button } from '../common/Button'
import type { MapLayerFilter } from '../../lib/map/constants'
import {
  ROAD_TYPE_FILTER_OPTIONS,
  SEVERITY_FILTER_OPTIONS,
  type MapRoadTypeFilter,
} from '../../lib/map/nominatimSearch'
import { useI18n } from '../../lib/i18n'
import { MapSidePanel } from './MapSidePanel'

export type MapFilterPanelProps = {
  open: boolean
  filter: MapLayerFilter
  severityFilters: ComplaintSeverity[]
  roadTypeFilters: MapRoadTypeFilter[]
  onFilterChange: (filter: MapLayerFilter) => void
  onToggleSeverity: (severity: ComplaintSeverity) => void
  onToggleRoadType: (roadType: MapRoadTypeFilter) => void
  onClearFilters: () => void
  onClose: () => void
  roadTypeQuery: string
  onRoadTypeQueryChange: (value: string) => void
}

const LAYER_OPTIONS: MapLayerFilter[] = ['all', 'roads', 'complaints']

export function MapFilterPanel({
  open,
  filter,
  severityFilters,
  roadTypeFilters,
  onFilterChange,
  onToggleSeverity,
  onToggleRoadType,
  onClearFilters,
  onClose,
  roadTypeQuery,
  onRoadTypeQueryChange,
}: MapFilterPanelProps) {
  const { t } = useI18n()

  if (!open) return null

  const filteredRoadTypes = ROAD_TYPE_FILTER_OPTIONS.filter((option) =>
    option.toLowerCase().includes(roadTypeQuery.trim().toLowerCase()),
  )

  return (
    <MapSidePanel
      title={t('filterPanelTitle')}
      onClose={onClose}
      closeLabel={t('closeDetails')}
      footer={
        <div className="flex flex-col gap-2">
          <Button type="button" onClick={onClose}>
            {t('filterPanelApply')}
          </Button>
          <Button type="button" variant="outline" onClick={onClearFilters}>
            {t('filterPanelClear')}
          </Button>
        </div>
      }
      className="z-[520]"
    >
      <div className="flex flex-col gap-6">
        <section>
          <h4 className="mb-2 text-sm font-semibold text-[var(--rw-text-primary)]">
            {t('filterLayers')}
          </h4>
          <div className="flex flex-wrap gap-2">
            {LAYER_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onFilterChange(option)}
                className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                  filter === option
                    ? 'bg-[var(--rw-primary)] font-medium text-[var(--rw-primary-foreground)]'
                    : 'bg-[var(--rw-surface-muted)] text-[var(--rw-text-primary)] hover:bg-[var(--rw-border)]'
                }`}
                aria-pressed={filter === option}
              >
                {option === 'all'
                  ? t('filterAll')
                  : option === 'roads'
                    ? t('filterRoads')
                    : t('filterComplaints')}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h4 className="mb-2 text-sm font-semibold text-[var(--rw-text-primary)]">
            {t('filterSeverity')}
          </h4>
          <div className="flex flex-wrap gap-2">
            {SEVERITY_FILTER_OPTIONS.map((severity) => (
              <button
                key={severity}
                type="button"
                onClick={() => onToggleSeverity(severity)}
                className={`rounded-full px-3 py-1.5 text-sm capitalize transition-colors ${
                  severityFilters.includes(severity)
                    ? 'bg-[var(--rw-primary)] font-medium text-[var(--rw-primary-foreground)]'
                    : 'bg-[var(--rw-surface-muted)] text-[var(--rw-text-primary)] hover:bg-[var(--rw-border)]'
                }`}
                aria-pressed={severityFilters.includes(severity)}
              >
                {t(severity)}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h4 className="mb-2 text-sm font-semibold text-[var(--rw-text-primary)]">
            {t('filterRoadType')}
          </h4>
          <input
            type="search"
            value={roadTypeQuery}
            onChange={(event) => onRoadTypeQueryChange(event.target.value)}
            placeholder={t('filterRoadTypeSearch')}
            className="mb-3 w-full rounded-xl border border-[var(--rw-border)] bg-[var(--rw-surface-muted)] px-3 py-2 text-sm text-[var(--rw-text-primary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--rw-ring)]"
          />
          <div className="flex max-h-40 flex-col gap-1 overflow-y-auto">
            {filteredRoadTypes.map((roadType) => (
              <button
                key={roadType}
                type="button"
                onClick={() => onToggleRoadType(roadType)}
                className={`rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                  roadTypeFilters.includes(roadType)
                    ? 'bg-[var(--rw-primary)] font-medium text-[var(--rw-primary-foreground)]'
                    : 'text-[var(--rw-text-primary)] hover:bg-[var(--rw-surface-muted)]'
                }`}
                aria-pressed={roadTypeFilters.includes(roadType)}
              >
                {roadType}
              </button>
            ))}
          </div>
        </section>
      </div>
    </MapSidePanel>
  )
}
