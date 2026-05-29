import { Bot, FileWarning, MapPin, Shield } from 'lucide-react'
import type { FeatureItem } from '../components/home/FeatureGrid'
import { mockRoads } from './roads'

export const homePageCopy = {
  heroSubtitle: 'Road Safety Transparency',
  heroTitle: 'RoadWatch',
  heroDescription:
    'AI-powered citizen transparency for roads, budgets, contractors, and safety alerts across India.',
  exploreTitle: 'Explore Roads',
  exploreDescription: `Search and select from ${mockRoads.length} monitored corridors to view budget, contractor, and repair records.`,
  mapTitle: 'Road Map',
  mapDescription: 'Interactive OpenStreetMap view with NH, SH, and MDR road layers',
  featuresTitle: 'Platform Capabilities',
  featuresDescription:
    'Tools for citizens and authorities to improve road safety and accountability.',
} as const

export const homeFeatures: FeatureItem[] = [
  {
    icon: MapPin,
    title: 'Interactive Road Map',
    description: 'Search roads and view maintenance details on an interactive map.',
  },
  {
    icon: FileWarning,
    title: 'Complaint Filing',
    description: 'Report road issues with photos, location, and severity details.',
  },
  {
    icon: Bot,
    title: 'RoadWatch AI',
    description: 'Ask questions about contractors, budgets, repairs, and complaint history.',
  },
  {
    icon: Shield,
    title: 'Safety Alerts',
    description: 'Stay informed about closures, waterlogging, and high-risk zones.',
  },
]
