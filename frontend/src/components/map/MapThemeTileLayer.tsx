import { TileLayer } from 'react-leaflet'
import {
  CARTO_DARK_TILE_URL,
  CARTO_LIGHT_TILE_URL,
  CARTO_TILE_ATTRIBUTION,
} from '../../lib/map/constants'
import { useMapTheme } from '../../hooks/useMapTheme'

export function MapThemeTileLayer() {
  const theme = useMapTheme()
  const url = theme === 'dark' ? CARTO_DARK_TILE_URL : CARTO_LIGHT_TILE_URL

  return <TileLayer key={theme} url={url} attribution={CARTO_TILE_ATTRIBUTION} noWrap={false} />
}
