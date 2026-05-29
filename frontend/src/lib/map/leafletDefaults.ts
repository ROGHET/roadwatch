import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// Leaflet default icon paths break under Vite bundling.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const defaultIcon = L.Icon.Default.prototype as any
if (defaultIcon._getIconUrl) {
  delete defaultIcon._getIconUrl
}

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
})
