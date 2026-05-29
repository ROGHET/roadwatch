import { create } from 'zustand'
import { INDIA_CENTER, INDIA_DEFAULT_ZOOM, type MapLayerFilter } from '../lib/map/constants'
import type { RoutePreviewSnapshot, RoutePreviewTarget } from '../lib/map/providers/types'
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
  routePreview: RoutePreviewSnapshot | null
  routePreviewTarget: RoutePreviewTarget | null
  routePreviewOpen: boolean
  mapSessionId: number
  isExpanded: boolean
  hasUserViewport: boolean
  skipMapTeardown: boolean
  setViewport: (center: Pick<MapViewport, 'lat' | 'lng'>, zoom: number) => void
  setFilter: (filter: MapLayerFilter) => void
  setSelection: (selection: MapActiveSelection) => void
  clearSelection: () => void
  setRoutePreview: (routePreview: RoutePreviewSnapshot | null) => void
  setRoutePreviewTarget: (target: RoutePreviewTarget | null) => void
  setRoutePreviewOpen: (open: boolean) => void
  clearRoutePreview: () => void
  setExpanded: (expanded: boolean) => void
  requestExpandMap: () => void
  persistForNavigation: () => void
  resetMapForFreshOpen: () => void
  leaveMapExplorer: () => void
  clearTransientMapUi: () => void
}

export const useMapStore = create<MapStoreState>((set) => ({
  center: { lat: INDIA_CENTER.lat, lng: INDIA_CENTER.lng, zoom: INDIA_DEFAULT_ZOOM },
  filter: 'all',
  selection: null,
  routePreview: null,
  routePreviewTarget: null,
  routePreviewOpen: false,
  mapSessionId: 0,
  isExpanded: false,
  hasUserViewport: false,
  skipMapTeardown: false,

  setViewport: (center, zoom) => {
    set({
      center: { lat: center.lat, lng: center.lng, zoom },
      hasUserViewport: true,
    })
  },

  setFilter: (filter) => set({ filter }),

  setSelection: (selection) => set({ selection }),

  clearSelection: () => set({ selection: null }),

  setRoutePreview: (routePreview) => set({ routePreview }),

  setRoutePreviewTarget: (routePreviewTarget) => set({ routePreviewTarget }),

  setRoutePreviewOpen: (routePreviewOpen) => set({ routePreviewOpen }),

  clearRoutePreview: () => set({ routePreview: null, routePreviewTarget: null, routePreviewOpen: false }),

  setExpanded: (isExpanded) => set({ isExpanded }),

  requestExpandMap: () => set({ isExpanded: true }),

  persistForNavigation: () =>
    set((state) => ({
      skipMapTeardown: state.isExpanded,
      selection: null,
      routePreview: null,
      routePreviewTarget: null,
      routePreviewOpen: false,
    })),

  leaveMapExplorer: () =>
    set((state) => {
      if (state.skipMapTeardown) {
        return {
          skipMapTeardown: false,
          selection: null,
          routePreview: null,
          routePreviewTarget: null,
          routePreviewOpen: false,
        }
      }

      return {
        selection: null,
        routePreview: null,
        routePreviewTarget: null,
        routePreviewOpen: false,
        isExpanded: false,
      }
    }),

  resetMapForFreshOpen: () => {
    set((state) => ({
      center: { lat: INDIA_CENTER.lat, lng: INDIA_CENTER.lng, zoom: INDIA_DEFAULT_ZOOM },
      filter: 'all',
      selection: null,
      routePreview: null,
      routePreviewTarget: null,
      routePreviewOpen: false,
      isExpanded: true,
      hasUserViewport: false,
      mapSessionId: state.mapSessionId + 1,
    }))
  },

  clearTransientMapUi: () => {
    set({
      selection: null,
      routePreview: null,
      routePreviewTarget: null,
      routePreviewOpen: false,
      isExpanded: false,
    })
  },
}))

export function getInitialMapViewport(hasUserViewport: boolean, center: MapViewport) {
  if (hasUserViewport) {
    return { lat: center.lat, lng: center.lng, zoom: center.zoom }
  }
  return { lat: INDIA_CENTER.lat, lng: INDIA_CENTER.lng, zoom: INDIA_DEFAULT_ZOOM }
}
