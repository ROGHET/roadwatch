import type { ComplaintListItem } from '../../components/complaints/ComplaintListSection'
import type { MockRoad } from '../../data/roads'
import type { LocationWeatherSnapshot } from './locationIntelligence'

export type MapComplaintMarker = ComplaintListItem & {
  roadId: string
  lat: number
  lng: number
}

export type MapActiveSelection =
  | { kind: 'road'; road: MockRoad }
  | { kind: 'complaint'; complaint: MapComplaintMarker }
  | {
      kind: 'location'
      lat: number
      lng: number
      intelligence: LocationWeatherSnapshot
    }
