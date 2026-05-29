import { motion, useReducedMotion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import { Button } from '../common/Button'
import { EmptyState } from '../common/EmptyState'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { SectionHeader } from '../common/SectionHeader'
import { useRoads } from '../../hooks/useRoads'
import { fadeInUp, staggerContainer, staggerItem } from '../../lib/motion'
import { routes } from '../../lib/routes'
import { RoadSummaryCard } from './RoadSummaryCard'

export type RoadExplorerSectionProps = {
  title: string
  description?: string
}

export function RoadExplorerSection({ title, description }: RoadExplorerSectionProps) {
  const prefersReducedMotion = useReducedMotion()
  const { data: roads, isPending, isError } = useRoads()

  return (
    <motion.section
      className="flex flex-col gap-4"
      aria-label={title}
      variants={prefersReducedMotion ? undefined : fadeInUp}
      initial={prefersReducedMotion ? false : 'hidden'}
      whileInView={prefersReducedMotion ? undefined : 'visible'}
      viewport={{ once: true, margin: '-48px' }}
    >
      <SectionHeader title={title} description={description} />

      {isPending ? (
        <LoadingSpinner label="Loading monitored roads" className="py-12" />
      ) : null}

      {isError ? (
        <EmptyState
          icon={AlertCircle}
          title="Unable to load roads"
          description="Road records could not be loaded. Check your connection and try again."
        />
      ) : null}

      {!isPending && !isError && roads && roads.length === 0 ? (
        <EmptyState
          title="No roads available"
          description="Monitored road records will appear here when published."
        />
      ) : null}

      {!isPending && !isError && roads && roads.length > 0 ? (
        <motion.ul
          className="grid gap-4 sm:grid-cols-2"
          role="list"
          variants={prefersReducedMotion ? undefined : staggerContainer}
          initial={prefersReducedMotion ? false : 'hidden'}
          animate={prefersReducedMotion ? undefined : 'visible'}
        >
          {roads.map((road) => (
            <motion.li key={road.id} role="listitem" variants={prefersReducedMotion ? undefined : staggerItem}>
              <RoadSummaryCard
                roadName={road.roadName}
                roadType={road.roadType}
                score={road.score}
                scoreTier={road.scoreTier}
                status={road.status}
                riskLevel={road.riskLevel}
                contractor={road.contractor}
                authority={road.authority}
                lastRepairDate={road.lastRepairDate}
                maintenanceSchedule={road.maintenanceSchedule}
                inspectionDue={road.inspectionDue}
                budgetProgram={road.budgetProgram}
                budgetHistory={road.budgetHistory}
                className="h-full"
                footer={
                  <Button type="button" variant="outline" size="sm" to={routes.road(road.id)}>
                    View road details
                  </Button>
                }
              />
            </motion.li>
          ))}
        </motion.ul>
      ) : null}
    </motion.section>
  )
}
