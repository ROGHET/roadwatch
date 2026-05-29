import {
  Bot,
  FileWarning,
  MapPin,
  Shield,
} from 'lucide-react'
import { Button } from '../../components/common/Button'
import { PageContainer } from '../../components/common/PageContainer'
import { SectionHeader } from '../../components/common/SectionHeader'
import { FeatureGrid } from '../../components/home/FeatureGrid'
import { HeroSection } from '../../components/home/HeroSection'
import { MapPlaceholder } from '../../components/map/MapPlaceholder'

const homeFeatures = [
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

export default function HomePage() {
  return (
    <PageContainer className="gap-8">
      <HeroSection
        subtitle="Road Safety Transparency"
        title="RoadWatch"
        description="AI-powered citizen transparency for roads, budgets, contractors, and safety alerts."
        actions={
          <>
            <Button type="button">Report an Issue</Button>
            <Button type="button" variant="outline">
              Ask RoadWatch AI
            </Button>
          </>
        }
      />

      <section className="flex flex-col gap-4">
        <SectionHeader
          title="Explore Roads"
          description="Select a road on the map to view budget, contractor, and repair information."
        />
        <MapPlaceholder
          title="Road Map"
          description="Interactive OpenStreetMap view will load here"
          minHeightClassName="min-h-72 sm:min-h-96"
        />
      </section>

      <FeatureGrid
        title="Platform Capabilities"
        description="Tools for citizens and authorities to improve road safety and accountability."
        features={homeFeatures}
        columns={2}
      />
    </PageContainer>
  )
}
