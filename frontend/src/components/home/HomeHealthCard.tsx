import { Activity } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../../lib/i18n'
import { mockRoads } from '../../data/roads'
import { routes } from '../../lib/routes'
import { MetricCard } from '../stitch'

function computeInfrastructureHealth() {
  if (mockRoads.length === 0) return 94
  const averageScore = mockRoads.reduce((sum, road) => sum + road.score, 0) / mockRoads.length
  return Math.round(averageScore)
}

export function HomeHealthCard() {
  const navigate = useNavigate()
  const health = computeInfrastructureHealth()
  const { t } = useI18n()

  return (
    <MetricCard
      label={t('infrastructureHealth')}
      value={`${health}%`}
      meta="+2.4% vs last week"
      description={t('infrastructureHealthDesc')}
      icon={Activity}
      accentClassName="text-[var(--st-tertiary)]"
      progress={health}
      onClick={() => navigate(routes.dashboard)}
    />
  )
}
