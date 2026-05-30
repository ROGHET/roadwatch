export type InferredPlace = {
  city: string
  state: string
  label: string
}

const regions: Array<InferredPlace & { minLat: number; maxLat: number; minLng: number; maxLng: number }> = [
  {
    minLat: 18.8,
    maxLat: 19.4,
    minLng: 72.7,
    maxLng: 73.2,
    city: 'Mumbai',
    state: 'Maharashtra',
    label: 'Mumbai, Maharashtra',
  },
  {
    minLat: 12.8,
    maxLat: 13.2,
    minLng: 80.1,
    maxLng: 80.4,
    city: 'Chennai',
    state: 'Tamil Nadu',
    label: 'Chennai, Tamil Nadu',
  },
  {
    minLat: 22.4,
    maxLat: 22.9,
    minLng: 75.6,
    maxLng: 76.1,
    city: 'Indore',
    state: 'Madhya Pradesh',
    label: 'Indore, Madhya Pradesh',
  },
  {
    minLat: 23.0,
    maxLat: 23.4,
    minLng: 79.7,
    maxLng: 80.1,
    city: 'Jabalpur',
    state: 'Madhya Pradesh',
    label: 'Jabalpur, Madhya Pradesh',
  },
  {
    minLat: 28.4,
    maxLat: 28.9,
    minLng: 76.8,
    maxLng: 77.4,
    city: 'Delhi',
    state: 'Delhi',
    label: 'Delhi, Delhi',
  },
]

export function inferPlaceFromCoordinates(lat: number, lng: number): InferredPlace {
  const match = regions.find(
    (region) =>
      lat >= region.minLat &&
      lat <= region.maxLat &&
      lng >= region.minLng &&
      lng <= region.maxLng,
  )

  if (match) {
    return {
      city: match.city,
      state: match.state,
      label: match.label,
    }
  }

  return {
    city: 'Unknown City',
    state: 'Unknown State',
    label: `Coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
  }
}
