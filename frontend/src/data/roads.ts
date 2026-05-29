import type { RoadSummaryCardProps } from '../components/road/RoadSummaryCard'

export type MockRoad = {
  id: string
  lat: number
  lng: number
} & Omit<RoadSummaryCardProps, 'footer' | 'className'>

export type RoadSelectOption = {
  value: string
  label: string
}

export const mockRoads: MockRoad[] = [
  {
    id: 'chennai-sardar-patel-road',
    lat: 13.0067,
    lng: 80.2206,
    roadName: 'Sardar Patel Road',
    roadType: 'State Highway (SH-109A)',
    score: 78,
    scoreTier: 'good',
    status: 'open',
    riskLevel: 'medium',
    contractor: 'Tamil Nadu Road Development Company Ltd.',
    authority: 'Tamil Nadu State Highways Department',
    lastRepairDate: '12 March 2026',
  },
  {
    id: 'chennai-gst-road',
    lat: 13.0287,
    lng: 80.1742,
    roadName: 'GST Road (Grand Southern Trunk Road)',
    roadType: 'National Highway (NH-32)',
    score: 64,
    scoreTier: 'fair',
    status: 'under_repair',
    riskLevel: 'high',
    contractor: 'Larsen & Toubro Infrastructure',
    authority: 'National Highways Authority of India (NHAI)',
    lastRepairDate: '8 January 2026',
  },
  {
    id: 'chennai-omr-service-lane',
    lat: 12.9815,
    lng: 80.2482,
    roadName: 'OMR Service Lane (Rajiv Gandhi Salai)',
    roadType: 'Major District Road (MDR)',
    score: 71,
    scoreTier: 'good',
    status: 'open',
    riskLevel: 'medium',
    contractor: 'Chennai Metropolitan Development Authority',
    authority: 'Greater Chennai Corporation',
    lastRepairDate: '22 February 2026',
  },
  {
    id: 'chennai-ecr-highway',
    lat: 12.8996,
    lng: 80.2459,
    roadName: 'East Coast Road (ECR)',
    roadType: 'State Highway (SH-49)',
    score: 55,
    scoreTier: 'fair',
    status: 'under_repair',
    riskLevel: 'high',
    contractor: 'GVK Road Projects Ltd.',
    authority: 'Tamil Nadu State Highways Department',
    lastRepairDate: '5 November 2025',
  },
  {
    id: 'chennai-anna-salai',
    lat: 13.0604,
    lng: 80.2647,
    roadName: 'Anna Salai (Mount Road)',
    roadType: 'Urban Arterial Road',
    score: 82,
    scoreTier: 'excellent',
    status: 'open',
    riskLevel: 'low',
    contractor: 'Metro Tunnelling & Infrastructure Pvt. Ltd.',
    authority: 'Greater Chennai Corporation',
    lastRepairDate: '18 April 2026',
  },
  {
    id: 'mumbai-western-express',
    lat: 19.1176,
    lng: 72.856,
    roadName: 'Western Express Highway',
    roadType: 'National Highway (NH-48)',
    score: 69,
    scoreTier: 'good',
    status: 'open',
    riskLevel: 'medium',
    contractor: 'Reliance Infrastructure Ltd.',
    authority: 'National Highways Authority of India (NHAI)',
    lastRepairDate: '30 December 2025',
  },
  {
    id: 'delhi-ring-road',
    lat: 28.5677,
    lng: 77.209,
    roadName: 'Ring Road (Mahatma Gandhi Marg)',
    roadType: 'National Highway (NH-44)',
    score: 48,
    scoreTier: 'poor',
    status: 'closed',
    riskLevel: 'critical',
    contractor: 'PWD Delhi Circle-3',
    authority: 'Public Works Department, Government of NCT of Delhi',
    lastRepairDate: '14 August 2025',
  },
  {
    id: 'bengaluru-hosur-road',
    lat: 12.9102,
    lng: 77.6166,
    roadName: 'Hosur Road (NH-48)',
    roadType: 'National Highway (NH-48)',
    score: 61,
    scoreTier: 'fair',
    status: 'under_repair',
    riskLevel: 'high',
    contractor: 'NCC Limited',
    authority: 'National Highways Authority of India (NHAI)',
    lastRepairDate: '2 February 2026',
  },
]

export const roadSelectOptions: RoadSelectOption[] = mockRoads.map((road) => ({
  value: road.id,
  label: road.roadName,
}))
