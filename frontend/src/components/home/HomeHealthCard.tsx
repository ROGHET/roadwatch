import { Activity } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { accidentRecords } from '../../data/realDatasets'
import { computeCompositeHealth } from '../../lib/analytics/riskEngine'
import { useI18n } from '../../lib/i18n'
import { routes } from '../../lib/routes'
import { MetricCard } from '../stitch'

export function HomeHealthCard() {
  const navigate = useNavigate()
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
    <MetricCard
      label={t('infrastructureHealth')}
      value={`${health.score}/100`}
      meta={`${tierLabel} • ADSI + budget + tender + weather factors`}
      description={`${accidentRecords.length} ADSI regions loaded; composite score from real parliamentary and NCRB datasets.`}
      icon={Activity}
      accentClassName="text-[var(--st-tertiary)]"
      progress={health.score}
      onClick={() => navigate(routes.dashboard)}
    />
  )
}
