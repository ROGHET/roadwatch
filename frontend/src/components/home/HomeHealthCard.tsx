import { Activity } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
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

  return (
    <MetricCard
      label="Infrastructure Health"
      value={`${health}%`}
      meta="+2.4% vs last week"
      description="View road quality, budget utilization, contractor performance, and complaint trends on the dashboard."
      icon={Activity}
      accentClassName="text-[var(--st-tertiary)]"
      progress={health}
      onClick={() => navigate(routes.dashboard)}
    />
  )
}
