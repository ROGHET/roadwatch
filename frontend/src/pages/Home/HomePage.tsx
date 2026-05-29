import { motion, useReducedMotion } from 'framer-motion'
import { Button } from '../../components/common/Button'
import { PageContainer } from '../../components/common/PageContainer'
import { SectionHeader } from '../../components/common/SectionHeader'
import { FeatureGrid } from '../../components/home/FeatureGrid'
import { HeroSection } from '../../components/home/HeroSection'
import { MapPlaceholder } from '../../components/map/MapPlaceholder'
import { homeFeatures, homePageCopy } from '../../data/home'
import { fadeInUp } from '../../lib/motion'

export default function HomePage() {
  const prefersReducedMotion = useReducedMotion()

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

      <motion.section
        className="flex flex-col gap-4"
        variants={prefersReducedMotion ? undefined : fadeInUp}
        initial={prefersReducedMotion ? false : 'hidden'}
        whileInView={prefersReducedMotion ? undefined : 'visible'}
        viewport={{ once: true, margin: '-40px' }}
      >
        <SectionHeader
          title={homePageCopy.exploreTitle}
          description={homePageCopy.exploreDescription}
        />
        <MapPlaceholder
          title={homePageCopy.mapTitle}
          description={homePageCopy.mapDescription}
          minHeightClassName="min-h-72 sm:min-h-96"
        />
      </motion.section>

      <FeatureGrid
        title={homePageCopy.featuresTitle}
        description={homePageCopy.featuresDescription}
        features={homeFeatures}
        columns={2}
      />
    </PageContainer>
  )
}
