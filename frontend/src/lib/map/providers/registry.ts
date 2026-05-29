import { resolveAqiProvider } from './aqiProviders'
import { resolveRouteProvider } from './routeProviders'
import { resolveTrafficProvider } from './trafficProviders'
import { resolveWeatherProvider } from './weatherProviders'

export function getWeatherProvider() {
  return resolveWeatherProvider(import.meta.env)
}

export function getAqiProvider() {
  return resolveAqiProvider(import.meta.env)
}

export function getTrafficProvider() {
  return resolveTrafficProvider(import.meta.env)
}

export function getRouteProvider() {
  return resolveRouteProvider(import.meta.env)
}
