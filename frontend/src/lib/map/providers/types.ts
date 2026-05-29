export type MapCoordinates = {
  lat: number
  lng: number
}

export type WeatherSnapshot = {
  locationName: string
  temperatureC: number
  condition: string
  humidityPercent: number
  windSpeedKph: number
  visibilityKm: number
  rainProbabilityPercent: number
  source: string
  observedAt: string
}

export type AirQualitySnapshot = {
  locationName: string
  aqi: number
  aqiLabel: string
  source: string
  observedAt: string
}

export type TrafficSnapshot = {
  locationName: string
  condition: 'light' | 'moderate' | 'heavy' | 'severe'
  description: string
  source: string
  observedAt: string
}

export type RoutePreviewSnapshot = {
  origin: MapCoordinates
  destination: MapCoordinates
  originLabel: string
  destinationLabel: string
  distanceKm: number
  travelTimeMinutes: number
  overview: string
  instructions: string[]
  path: MapCoordinates[]
  source: string
  observedAt: string
}

export type RoutePreviewTarget = {
  origin?: MapCoordinates
  destination: MapCoordinates
  originLabel?: string
  destinationLabel: string
}

export interface WeatherProvider {
  id: string
  label: string
  getWeather(request: MapCoordinates): Promise<WeatherSnapshot>
}

export interface AQIProvider {
  id: string
  label: string
  getAQI(request: MapCoordinates): Promise<AirQualitySnapshot>
}

export interface TrafficProvider {
  id: string
  label: string
  getTraffic(request: MapCoordinates): Promise<TrafficSnapshot>
}

export interface RouteProvider {
  id: string
  label: string
  getRoutePreview(request: {
    origin: MapCoordinates
    destination: MapCoordinates
    originLabel: string
    destinationLabel: string
  }): Promise<RoutePreviewSnapshot>
}
