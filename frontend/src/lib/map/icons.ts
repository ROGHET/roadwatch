import L from 'leaflet'
import type { ComplaintSeverity } from '../../components/complaints/ComplaintCard'
import type { RoadStatus } from '../../components/road/RoadStatusBadge'

const roadMarkerSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round">
  <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
  <circle cx="12" cy="10" r="3"/>
</svg>`

const complaintMarkerSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round">
  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/>
  <path d="M12 9v4"/>
  <path d="M12 17h.01"/>
</svg>`

const roadStatusClass: Record<RoadStatus, string> = {
  open: 'rw-map-marker-road-open',
  under_repair: 'rw-map-marker-road-repair',
  closed: 'rw-map-marker-road-closed',
  unknown: 'rw-map-marker-road-unknown',
}

const complaintSeverityClass: Record<ComplaintSeverity, string> = {
  low: 'rw-map-marker-complaint-low',
  medium: 'rw-map-marker-complaint-medium',
  high: 'rw-map-marker-complaint-high',
  critical: 'rw-map-marker-complaint-critical',
}

function markerHtml(markerClass: string, iconSvg: string, statusDot?: string) {
  return `<div class="rw-map-marker-pin">
    <div class="rw-map-marker ${markerClass}">
      ${iconSvg}
      ${statusDot ?? ''}
    </div>
    <span class="rw-map-marker-tail" aria-hidden="true"></span>
  </div>`
}

const routeStartSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="9" />
  <path d="M12 7v10" />
  <path d="m8.5 10 3.5-3.5 3.5 3.5" />
</svg>`

const routeDestinationSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="9" />
  <path d="M7 12h10" />
  <path d="m14 8 4 4-4 4" />
</svg>`

export function createRoadMarkerIcon(status: RoadStatus) {
  const statusDot = `<span class="rw-map-marker-status-dot" aria-hidden="true"></span>`

  return L.divIcon({
    className: 'rw-map-marker-root',
    html: markerHtml(`rw-map-marker-road ${roadStatusClass[status]}`, roadMarkerSvg, statusDot),
    iconSize: [44, 52],
    iconAnchor: [22, 48],
    popupAnchor: [0, -48],
  })
}

export function createComplaintMarkerIcon(severity: ComplaintSeverity = 'medium') {
  return L.divIcon({
    className: 'rw-map-marker-root',
    html: markerHtml(
      `rw-map-marker-complaint ${complaintSeverityClass[severity]}`,
      complaintMarkerSvg,
    ),
    iconSize: [44, 52],
    iconAnchor: [22, 48],
    popupAnchor: [0, -48],
  })
}

export function createUserLocationIcon(heading: number | null) {
  const headingMarkup =
    heading !== null
      ? `<div class="rw-user-heading-cone" style="transform: rotate(${heading}deg)" aria-hidden="true"></div>`
      : ''

  return L.divIcon({
    className: 'rw-map-marker-root rw-user-location-root',
    html: `<div class="rw-user-location-marker">
      ${headingMarkup}
      <div class="rw-user-location-dot" aria-hidden="true"></div>
    </div>`,
    iconSize: [80, 80],
    iconAnchor: [40, 40],
  })
}

export function createRouteEndpointIcon(kind: 'start' | 'destination') {
  const markerClass =
    kind === 'start' ? 'rw-route-marker-start' : 'rw-route-marker-destination'
  const iconSvg = kind === 'start' ? routeStartSvg : routeDestinationSvg

  return L.divIcon({
    className: 'rw-map-marker-root rw-route-marker-root',
    html: markerHtml(markerClass, iconSvg),
    iconSize: [40, 48],
    iconAnchor: [20, 42],
  })
}
