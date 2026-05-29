/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_USE_MOCK_DATA?: string
  readonly VITE_MAP_WEATHER_PROVIDER?: string
  readonly VITE_OPENWEATHER_API_KEY?: string
  readonly VITE_MAP_AQI_PROVIDER?: string
  readonly VITE_AQICN_API_KEY?: string
  readonly VITE_WAQI_API_KEY?: string
  readonly VITE_MAP_TRAFFIC_PROVIDER?: string
  readonly VITE_TRAFFIC_API_ENDPOINT?: string
  readonly VITE_MAP_ROUTE_PROVIDER?: string
  readonly VITE_OPENROUTESERVICE_API_KEY?: string
  readonly VITE_MAPBOX_DIRECTIONS_API_KEY?: string
  readonly VITE_OSRM_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
