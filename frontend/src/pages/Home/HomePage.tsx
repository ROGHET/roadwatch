import { motion, useReducedMotion } from 'framer-motion'
import { Button } from '../../components/common/Button'
import { PageContainer } from '../../components/common/PageContainer'
import { FeatureGrid } from '../../components/home/FeatureGrid'
import { HeroSection } from '../../components/home/HeroSection'
import { MapExplorerSection } from '../../components/map/MapExplorerSection'
import { homeFeatures, homePageCopy } from '../../data/home'
import { fadeInUp } from '../../lib/motion'
import { routes } from '../../lib/routes'
import { useMapStore } from '../../stores/mapStore'

export default function HomePage() {
  const prefersReducedMotion = useReducedMotion()
  const requestExpandMap = useMapStore((state) => state.requestExpandMap)

  return (
    <div className="flex flex-col gap-8">
      <PageContainer className="gap-6">
        <HeroSection
          subtitle={homePageCopy.heroSubtitle}
          title={homePageCopy.heroTitle}
          description={homePageCopy.heroDescription}
          actions={
            <>
              <Button type="button" to={routes.complaint}>
                Report an Issue
              </Button>
              <Button type="button" variant="outline" to={routes.assistant}>
                Ask RoadWatch AI
              </Button>
            </>
          }
        />

        <MapExplorerSection />
      </PageContainer>

      <PageContainer className="gap-8">
        <motion.section
          variants={prefersReducedMotion ? undefined : fadeInUp}
          initial={prefersReducedMotion ? false : 'hidden'}
          whileInView={prefersReducedMotion ? undefined : 'visible'}
          viewport={{ once: true, margin: '-40px' }}
        >
          <FeatureGrid
            title={homePageCopy.featuresTitle}
            description={homePageCopy.featuresDescription}
            features={homeFeatures}
            columns={2}
            onExpandMap={requestExpandMap}
          />
        </motion.section>
      </PageContainer>
    </div>
  )
}
