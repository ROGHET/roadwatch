import type { ComplaintListItem } from '../../components/complaints/ComplaintListSection'
import type { MockRoad } from '../../data/roads'
import type { TollPlazaRecord } from '../../data/tollPlazas'
import type { LocationWeatherSnapshot } from './locationIntelligence'
import type { ExtendedWeatherIntelligence } from './weatherIntelligence'

export type MapComplaintMarker = ComplaintListItem & {
  roadId: string
  lat: number
  lng: number
}

export type MapActiveSelection =
  | { kind: 'road'; road: MockRoad }
  | { kind: 'complaint'; complaint: MapComplaintMarker }
  | { kind: 'toll'; toll: TollPlazaRecord }
  | {
      kind: 'location'
      lat: number
      lng: number
      intelligence: LocationWeatherSnapshot
      weatherIntel?: ExtendedWeatherIntelligence
    }
