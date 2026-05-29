export const INDIA_CENTER = {
  lat: 20.5937,
  lng: 78.9629,
} as const

export const INDIA_DEFAULT_ZOOM = 5
export const ROAD_FOCUS_ZOOM = 13
export const USER_LOCATION_ZOOM = 14
export const PREVIEW_ZOOM = 5

/** Prevent zooming out far enough to expose world-wrap tile gaps. */
export const MAP_MIN_ZOOM = 5
export const MAP_MAX_ZOOM = 18

/** Hard bounds around India and neighboring coverage; pairs with maxBoundsViscosity. */
export const INDIA_MAP_MAX_BOUNDS: [[number, number], [number, number]] = [
  [5.0, 66.5],
  [38.5, 101.0],
]
export const MAP_MAX_BOUNDS_VISCOSITY = 1.0

export const CARTO_DARK_TILE_URL =
  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
export const CARTO_LIGHT_TILE_URL =
  'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
export const CARTO_TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'

/** @deprecated Use Carto theme-aware tiles */
export const OSM_TILE_URL = CARTO_DARK_TILE_URL
export const OSM_TILE_ATTRIBUTION = CARTO_TILE_ATTRIBUTION

export type MapLayerFilter = 'all' | 'roads' | 'complaints'
export type MapDisplayMode = 'preview' | 'expanded'

/** Google Maps style user location blue */
export const USER_LOCATION_COLOR = '#4285F4'
