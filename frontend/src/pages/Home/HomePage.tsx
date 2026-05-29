import { Button } from '../../components/common/Button'
import { PageContainer } from '../../components/common/PageContainer'
import { SectionHeader } from '../../components/common/SectionHeader'
import { FeatureGrid } from '../../components/home/FeatureGrid'
import { HeroSection } from '../../components/home/HeroSection'
import { MapPlaceholder } from '../../components/map/MapPlaceholder'
import { homeFeatures, homePageCopy } from '../../data/home'

export default function HomePage() {
  return (
    <PageContainer className="gap-8">
      <HeroSection
        subtitle={homePageCopy.heroSubtitle}
        title={homePageCopy.heroTitle}
        description={homePageCopy.heroDescription}
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
          title={homePageCopy.exploreTitle}
          description={homePageCopy.exploreDescription}
        />
        <MapPlaceholder
          title={homePageCopy.mapTitle}
          description={homePageCopy.mapDescription}
          minHeightClassName="min-h-72 sm:min-h-96"
        />
      </section>

      <FeatureGrid
        title={homePageCopy.featuresTitle}
        description={homePageCopy.featuresDescription}
        features={homeFeatures}
        columns={2}
      />
    </PageContainer>
  )
}
