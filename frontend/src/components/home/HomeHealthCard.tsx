import { Activity } from 'lucide-react'
import { useMemo, useState } from 'react'
import { accidentRecords } from '../../data/realDatasets'
import { computeCompositeHealth } from '../../lib/analytics/riskEngine'
import { useI18n } from '../../lib/i18n'
import { MetricCard } from '../stitch'
import { InfrastructureHealthBreakdown } from './InfrastructureHealthBreakdown'

export function HomeHealthCard() {
  const [breakdownOpen, setBreakdownOpen] = useState(false)
  const { t } = useI18n()

  const health = useMemo(() => {
    const maharashtra = accidentRecords.find((row) =>
      row.stateOrCity.toLowerCase().includes('maharashtra'),
    )
    return computeCompositeHealth({
      state: maharashtra?.stateOrCity ?? 'Maharashtra',
      city: 'Mumbai',
    })
  }, [])

  const tierLabel =
    health.tier === 'critical'
      ? t('critical')
      : health.tier === 'poor'
        ? t('poor')
        : health.tier === 'fair'
          ? t('moderate')
          : health.tier === 'good'
            ? t('good')
            : t('excellent')

  return (
    <>
      <MetricCard
        label={t('infrastructureHealth')}
        value={`${health.score}%`}
        meta={`${tierLabel} • ADSI + CRIF + NHAI + Rajya Sabha`}
        description={`${accidentRecords.length} ADSI regions; tap for breakdown.`}
        icon={Activity}
        accentClassName="text-[var(--st-tertiary)]"
        progress={health.score}
        onClick={() => setBreakdownOpen(true)}
      />
      <InfrastructureHealthBreakdown open={breakdownOpen} onClose={() => setBreakdownOpen(false)} />
    </>
  )
}
