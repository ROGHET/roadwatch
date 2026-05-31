import { Bot, FileWarning, MapPin, Shield } from 'lucide-react'
import type { FeatureItem } from '../components/home/FeatureGrid'
import { routes } from '../lib/routes'
import { datasetSummary } from './datasetIntegration'

export const homePageCopy = {
  heroSubtitle: 'Road Safety Transparency',
  heroTitle: 'CrashZero',
  heroDescription:
    'AI-powered citizen transparency for roads, budgets, contractors, and safety alerts across India.',
  exploreTitle: 'Explore Roads',
  exploreDescription: `Search and explore ${datasetSummary.geoRoadSegments.toLocaleString('en-IN')} OSM road segments, ${datasetSummary.tollPlazas.toLocaleString('en-IN')} toll plazas, and parliamentary work packages.`,
  roadsListTitle: 'Monitored Corridors',
  roadsListDescription:
    'Select a road to view budget transparency, contractor records, and complaint history.',
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
    action: 'expand-map',
  },
  {
    icon: FileWarning,
    title: 'Complaint Filing',
    description: 'Report road issues with photos, location, and severity details.',
    href: routes.complaint,
  },
  {
    icon: Bot,
    title: 'CrashZero AI',
    description: 'Ask questions about contractors, budgets, repairs, and complaint history.',
    href: routes.assistant,
  },
  {
    icon: Shield,
    title: 'Safety Dashboard',
    description: 'Review complaint volume, severity trends, and resolution status.',
    href: routes.dashboard,
  },
]
