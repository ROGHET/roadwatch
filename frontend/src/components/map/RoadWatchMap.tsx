import { lazy, Suspense } from 'react'
import { LoadingSpinner } from '../common/LoadingSpinner'
import type { MapDisplayMode } from '../../lib/map/constants'

const RoadWatchMapView = lazy(() => import('./RoadWatchMapView'))

export type RoadWatchMapProps = {
  className?: string
  mode?: MapDisplayMode
}

export function RoadWatchMap({ className, mode = 'expanded' }: RoadWatchMapProps) {
  return (
    <div className={className}>
      <Suspense
        fallback={
          <div className="flex h-full min-h-[14rem] items-center justify-center bg-[var(--rw-surface-muted)]">
            <LoadingSpinner label="Loading map" />
          </div>
        }
      >
        <RoadWatchMapView mode={mode} />
      </Suspense>
    </div>
  )
}
