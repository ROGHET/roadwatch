import { create } from 'zustand'
import { INDIA_CENTER, INDIA_DEFAULT_ZOOM, type MapLayerFilter } from '../lib/map/constants'
import type { MapActiveSelection } from '../lib/map/types'

export type MapViewport = {
  lat: number
  lng: number
  zoom: number
}

type MapStoreState = {
  center: MapViewport
  filter: MapLayerFilter
  selection: MapActiveSelection | null
  isExpanded: boolean
  hasUserViewport: boolean
  restoreMapOnHome: boolean
  setViewport: (center: Pick<MapViewport, 'lat' | 'lng'>, zoom: number) => void
  setFilter: (filter: MapLayerFilter) => void
  setSelection: (selection: MapActiveSelection) => void
  clearSelection: () => void
  setExpanded: (expanded: boolean) => void
  requestExpandMap: () => void
  persistForNavigation: () => void
  consumeHomeRestore: () => boolean
}

export const useMapStore = create<MapStoreState>((set, get) => ({
  center: { lat: INDIA_CENTER.lat, lng: INDIA_CENTER.lng, zoom: INDIA_DEFAULT_ZOOM },
  filter: 'all',
  selection: null,
  isExpanded: false,
  hasUserViewport: false,
  restoreMapOnHome: false,

  setViewport: (center, zoom) => {
    set({
      center: { lat: center.lat, lng: center.lng, zoom },
      hasUserViewport: true,
    })
  },

  setFilter: (filter) => set({ filter }),

  setSelection: (selection) => set({ selection }),

  clearSelection: () => set({ selection: null }),

  setExpanded: (isExpanded) => set({ isExpanded }),

  requestExpandMap: () => set({ isExpanded: true }),

  persistForNavigation: () => {
    set({ hasUserViewport: true, restoreMapOnHome: true, isExpanded: true })
  },

  consumeHomeRestore: () => {
    const shouldRestore = get().restoreMapOnHome && get().hasUserViewport
    if (shouldRestore) {
      set({ isExpanded: true, restoreMapOnHome: false })
    }
    return shouldRestore
  },
}))

export function getInitialMapViewport(hasUserViewport: boolean, center: MapViewport) {
  if (hasUserViewport) {
    return { lat: center.lat, lng: center.lng, zoom: center.zoom }
  }
  return { lat: INDIA_CENTER.lat, lng: INDIA_CENTER.lng, zoom: INDIA_DEFAULT_ZOOM }
}
