import { Activity, Bot, FileWarning, HeartHandshake } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { BentoCard } from '../stitch'
import { routes } from '../../lib/routes'
import { useMapStore } from '../../stores/mapStore'

export function HomeQuickActions() {
  const navigate = useNavigate()
  const persistForNavigation = useMapStore((state) => state.persistForNavigation)

  return (
    <section className="grid grid-cols-2 gap-4 md:grid-cols-3" aria-label="Quick actions">
      <BentoCard
        label="Report Issue"
        icon={FileWarning}
        onClick={() => {
          persistForNavigation()
          navigate(routes.complaint)
        }}
      />
      <BentoCard
        label="AI Assistant"
        icon={Bot}
        accentClassName="text-[var(--st-tertiary)]"
        iconBgClassName="bg-[var(--st-tertiary)]/10"
        onClick={() => navigate(routes.assistant)}
      />
      <BentoCard
        label="My Impact"
        icon={HeartHandshake}
        accentClassName="text-[var(--st-secondary)]"
        iconBgClassName="bg-[var(--st-secondary)]/10"
        className="col-span-2 md:col-span-1"
        onClick={() => navigate(routes.dashboard)}
      />
      <BentoCard
        label="Live Map"
        icon={Activity}
        accentClassName="text-[var(--st-primary)]"
        iconBgClassName="bg-[var(--st-primary)]/10"
        className="col-span-2 md:col-span-3 lg:col-span-1"
        onClick={() => navigate(routes.map)}
      />
    </section>
  )
}
