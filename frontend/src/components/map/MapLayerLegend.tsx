import type { ReactNode } from 'react'
import { memo } from 'react'
import { twMerge } from 'tailwind-merge'
import { useMapStore } from '../../stores/mapStore'

type LegendToggleProps = {
  label: string
  checked: boolean
  swatch: ReactNode
  onChange: () => void
}

function LegendToggle({ label, checked, swatch, onChange }: LegendToggleProps) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-xs text-[var(--rw-text-secondary)]">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="size-3.5 rounded border-[var(--rw-border-strong)] accent-[var(--rw-primary)]"
      />
      {swatch}
      <span>{label}</span>
    </label>
  )
}

export const MapLayerLegend = memo(function MapLayerLegend() {
  const layerToggles = useMapStore((state) => state.layerToggles)
  const toggleLayer = useMapStore((state) => state.toggleLayerToggle)

  return (
    <div
      className={twMerge(
        'pointer-events-auto absolute bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-3 z-[480]',
        'rounded-xl border border-[var(--st-outline-white)] bg-[var(--rw-surface)]/92 px-3 py-2.5 shadow-lg backdrop-blur-md',
        'lg:bottom-4 lg:left-[calc(2.5rem+env(safe-area-inset-left))]',
      )}
      aria-label="Map layer legend"
    >
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--rw-text-tertiary)]">
        Map layers
      </p>
      <div className="flex flex-col gap-2">
        <LegendToggle
          label="Road"
          checked={layerToggles.roads}
          onChange={() => toggleLayer('roads')}
          swatch={<span className="inline-block h-0.5 w-5 rounded bg-[#38bdf8]" aria-hidden="true" />}
        />
        <LegendToggle
          label="Complaint"
          checked={layerToggles.complaints}
          onChange={() => toggleLayer('complaints')}
          swatch={
            <span
              className="inline-flex size-4 items-center justify-center rounded-full bg-[#f97316] text-[8px] text-white"
              aria-hidden="true"
            >
              !
            </span>
          }
        />
        <LegendToggle
          label="Toll Plaza"
          checked={layerToggles.tollPlazas}
          onChange={() => toggleLayer('tollPlazas')}
          swatch={
            <span
              className="inline-flex size-4 items-center justify-center rounded-md bg-[#eab308] text-[9px] font-bold text-[#422006]"
              aria-hidden="true"
            >
              ₹
            </span>
          }
        />
      </div>
    </div>
  )
})
