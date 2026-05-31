import type { ReactNode } from 'react'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  getAccidentChartData,
  getBudgetTrendChartData,
  getBudgetUtilizationSummary,
  getBudgetVsRoadQualityChartData,
  chartTooltipStyle,
  getComplaintIssueChartData,
  getComplaintResolutionChartData,
  SURFACE_QUALITY_DATASET_AVAILABLE,
  getContractorValueChartData,
  getProcurementChartData,
  getRiskHotspotChartData,
  getRoadContractSummary,
  getRoadQualityTierBreakdown,
  getTenderComplianceChartData,
  getTollAnalytics,
} from '../../lib/analytics/dashboardCharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../common/Card'
import { useI18n } from '../../lib/i18n'
import { useComplaintStore } from '../../stores/complaintStore'

const axisStyle = { fill: 'var(--rw-text-tertiary)', fontSize: 11 }
const gridStyle = { stroke: 'var(--rw-border)', strokeOpacity: 0.5 }

function ChartPanel({
  heightClass,
  children,
  emptyLabel,
  hasData,
}: {
  heightClass: string
  children: ReactNode
  emptyLabel: string
  hasData: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  useLayoutEffect(() => {
    const element = containerRef.current
    if (!element || !hasData) {
      setReady(false)
      return
    }
    const update = () => {
      const { width, height } = element.getBoundingClientRect()
      setReady(width > 0 && height > 0)
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(element)
    return () => observer.disconnect()
  }, [hasData, heightClass])

  if (!hasData) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border border-dashed border-[var(--rw-border)] bg-[var(--rw-surface-muted)] px-4 text-center text-sm text-[var(--rw-text-secondary)] ${heightClass}`}
      >
        {emptyLabel}
      </div>
    )
  }

  return (
    <div ref={containerRef} className={`w-full min-h-[12rem] ${heightClass}`}>
      {ready ? (
        <ResponsiveContainer width="100%" height="100%" minHeight={200}>
          {children}
        </ResponsiveContainer>
      ) : null}
    </div>
  )
}

export function AnalyticsDashboardSections() {
  const { t } = useI18n()
  const submittedComplaints = useComplaintStore((state) => state.submittedComplaints)
  const accidentData = useMemo(() => getAccidentChartData(), [])
  const complaintData = useMemo(
    () => getComplaintIssueChartData(submittedComplaints),
    [submittedComplaints],
  )
  const complaintResolutionData = useMemo(
    () => getComplaintResolutionChartData(submittedComplaints),
    [submittedComplaints],
  )
  const budgetData = useMemo(() => getBudgetTrendChartData(), [])
  const tenderData = useMemo(() => getTenderComplianceChartData(), [])
  const hotspotData = useMemo(() => getRiskHotspotChartData(), [])
  const contractorData = useMemo(() => getContractorValueChartData(), [])
  const procurementData = useMemo(() => getProcurementChartData(), [])
  const tollAnalytics = useMemo(() => getTollAnalytics(), [])
  const contractSummary = useMemo(() => getRoadContractSummary(), [])
  const budgetSummary = useMemo(() => getBudgetUtilizationSummary(), [])
  const roadQualityTiers = useMemo(() => getRoadQualityTierBreakdown(), [])
  const budgetQualityData = useMemo(() => getBudgetVsRoadQualityChartData(), [])

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="rw-glass-panel rw-glass-edge lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">{t('accidentDashboard')}</CardTitle>
          <CardDescription>{t('accidentDashboardDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartPanel
            heightClass="h-72"
            hasData={accidentData.length > 0}
            emptyLabel="Dataset load failed: ADSI_Table_1A.2.csv"
          >
            <BarChart data={accidentData}>
              <CartesianGrid strokeDasharray="3 3" style={gridStyle} />
              <XAxis dataKey="label" tick={axisStyle} interval={0} angle={-25} textAnchor="end" height={70} />
              <YAxis tick={axisStyle} />
              <Tooltip {...chartTooltipStyle} />
              <Legend />
              <Bar dataKey="accidents" fill="#38bdf8" name={t('accidents')} />
              <Bar dataKey="deaths" fill="#ef4444" name={t('deaths')} />
            </BarChart>
          </ChartPanel>
        </CardContent>
      </Card>

      <Card className="rw-glass-panel rw-glass-edge">
        <CardHeader>
          <CardTitle className="text-base">{t('riskHotspots')}</CardTitle>
          <CardDescription>{t('riskHotspotsDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartPanel
            heightClass="h-64"
            hasData={hotspotData.length > 0}
            emptyLabel="Dataset load failed: ADSI_Table_1A.2.csv"
          >
            <BarChart data={hotspotData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" style={gridStyle} />
              <XAxis type="number" tick={axisStyle} />
              <YAxis type="category" dataKey="label" width={100} tick={axisStyle} />
              <Tooltip {...chartTooltipStyle} />
              <Bar dataKey="riskScore" name={t('riskScore')}>
                {hotspotData.map((entry) => (
                  <Cell key={entry.label} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ChartPanel>
        </CardContent>
      </Card>

      <Card className="rw-glass-panel rw-glass-edge">
        <CardHeader>
          <CardTitle className="text-base">Complaint resolution</CardTitle>
          <CardDescription>Closed 62% • In progress 23% • Pending 15%</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartPanel
            heightClass="h-64"
            hasData={complaintResolutionData.some((row) => row.count > 0)}
            emptyLabel="No complaint records available"
          >
            <PieChart>
              <Pie
                data={complaintResolutionData}
                dataKey="count"
                nameKey="label"
                innerRadius={50}
                outerRadius={90}
              >
                {complaintResolutionData.map((entry) => (
                  <Cell key={entry.label} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip {...chartTooltipStyle} />
              <Legend />
            </PieChart>
          </ChartPanel>
        </CardContent>
      </Card>

      <Card className="rw-glass-panel rw-glass-edge">
        <CardHeader>
          <CardTitle className="text-base">{t('infrastructureReportsChart')}</CardTitle>
          <CardDescription>{t('infrastructureReportsDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartPanel
            heightClass="h-64"
            hasData={complaintData.length > 0}
            emptyLabel="Dataset load failed: RS_Session road works CSVs"
          >
            <PieChart>
              <Pie data={complaintData} dataKey="count" nameKey="label" innerRadius={50} outerRadius={90}>
                {complaintData.map((entry) => (
                  <Cell key={entry.label} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip {...chartTooltipStyle} />
              <Legend />
            </PieChart>
          </ChartPanel>
        </CardContent>
      </Card>

      <div id="budget-analytics" className="contents">
      <Card id="crif-budget-trend" className="rw-glass-panel rw-glass-edge lg:col-span-2 scroll-mt-24">
        <CardHeader>
          <CardTitle className="text-base">{t('budgetTrend')}</CardTitle>
          <CardDescription>{t('budgetTrendDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartPanel
            heightClass="h-72"
            hasData={budgetData.length > 0}
            emptyLabel="Dataset load failed: RS_Session_259_AU_1686_B_to_D.csv"
          >
            <LineChart data={budgetData}>
              <CartesianGrid strokeDasharray="3 3" style={gridStyle} />
              <XAxis dataKey="year" tick={axisStyle} />
              <YAxis tick={axisStyle} />
              <Tooltip {...chartTooltipStyle} />
              <Legend />
              <Line type="monotone" dataKey="sanctioned" stroke="#38bdf8" name={t('sanctioned')} />
              <Line type="monotone" dataKey="released" stroke="#22c55e" name={t('released')} />
              <Line type="monotone" dataKey="remaining" stroke="#f59e0b" name={t('remaining')} />
            </LineChart>
          </ChartPanel>
        </CardContent>
      </Card>

      <Card id="budget-vs-road-quality" className="rw-glass-panel rw-glass-edge lg:col-span-2 scroll-mt-24">
        <CardHeader>
          <CardTitle className="text-base">Budget vs Road Quality</CardTitle>
          <CardDescription>
            ADSI + CRIF • Highlights high budget with poor corridor quality (red cells)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartPanel
            heightClass="h-72"
            hasData={budgetQualityData.length > 0}
            emptyLabel="Dataset load failed: ADSI / CRIF"
          >
            <BarChart data={budgetQualityData}>
              <CartesianGrid strokeDasharray="3 3" style={gridStyle} />
              <XAxis dataKey="state" tick={axisStyle} interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={axisStyle} />
              <Tooltip {...chartTooltipStyle} />
              <Legend />
              <Bar dataKey="sanctioned" fill="#38bdf8" name={t('sanctioned')} />
              <Bar dataKey="released" fill="#22c55e" name={t('released')} />
              <Bar dataKey="utilized" fill="#a855f7" name="Utilized" />
              <Bar dataKey="roadQuality" fill="#f59e0b" name="Road quality">
                {budgetQualityData.map((entry) => (
                  <Cell
                    key={entry.state}
                    fill={entry.highBudgetPoorQuality ? '#ef4444' : entry.color}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartPanel>
          <p className="mt-3 text-xs text-[var(--rw-text-tertiary)]">
            Sanctioned ₹{budgetSummary.sanctioned.toFixed(1)} Cr • Released ₹{budgetSummary.released.toFixed(1)} Cr •
            Utilized ₹{budgetSummary.utilized.toFixed(1)} Cr (CRIF)
          </p>
        </CardContent>
      </Card>
      </div>

      {SURFACE_QUALITY_DATASET_AVAILABLE && roadQualityTiers.some((row) => row.count > 0) ? (
        <Card className="rw-glass-panel rw-glass-edge">
          <CardHeader>
            <CardTitle className="text-base">Road Quality Breakdown</CardTitle>
            <CardDescription>Surface quality tiers from monitored corridors</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartPanel heightClass="h-64" hasData={true} emptyLabel="">
              <BarChart data={roadQualityTiers}>
                <CartesianGrid strokeDasharray="3 3" style={gridStyle} />
                <XAxis dataKey="label" tick={axisStyle} />
                <YAxis tick={axisStyle} />
                <Tooltip {...chartTooltipStyle} />
                <Bar dataKey="count" name="Road segments">
                  {roadQualityTiers.map((entry) => (
                    <Cell key={entry.label} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ChartPanel>
          </CardContent>
        </Card>
      ) : null}

      <Card className="rw-glass-panel rw-glass-edge">
        <CardHeader>
          <CardTitle className="text-base">{t('tenderComplianceChart')}</CardTitle>
          <CardDescription>{t('tenderComplianceDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartPanel
            heightClass="h-64"
            hasData={tenderData.length > 0}
            emptyLabel="Dataset load failed: RS_Session_267_AU_546_A_to_B_i.csv"
          >
            <BarChart data={tenderData}>
              <CartesianGrid strokeDasharray="3 3" style={gridStyle} />
              <XAxis dataKey="ministry" tick={axisStyle} interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={axisStyle} />
              <Tooltip {...chartTooltipStyle} />
              <Legend />
              <Bar dataKey="evaluated" fill="#38bdf8" name={t('evaluated')} />
              <Bar dataKey="nonCompliant" fill="#ef4444" name={t('nonCompliant')} />
            </BarChart>
          </ChartPanel>
        </CardContent>
      </Card>

      <Card className="rw-glass-panel rw-glass-edge">
        <CardHeader>
          <CardTitle className="text-base">{t('tollAnalytics')}</CardTitle>
          <CardDescription>
            {tollAnalytics.totalPlazas.toLocaleString('en-IN')} {t('tollPlazas')} — {t('tollAnalyticsDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartPanel
            heightClass="h-64"
            hasData={tollAnalytics.byState.length > 0}
            emptyLabel="Dataset load failed: tolls-latest.json"
          >
            <BarChart data={tollAnalytics.byState} margin={{ bottom: 16 }}>
              <CartesianGrid strokeDasharray="3 3" style={gridStyle} />
              <XAxis dataKey="state" tick={axisStyle} interval={0} angle={-35} textAnchor="end" height={80} />
              <YAxis tick={axisStyle} />
              <Tooltip {...chartTooltipStyle} />
              <Bar dataKey="count" name={t('tollPlazas')}>
                {tollAnalytics.byState.map((entry) => (
                  <Cell key={entry.state} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ChartPanel>
        </CardContent>
      </Card>

      <Card id="contractor-awards" className="rw-glass-panel rw-glass-edge lg:col-span-2 scroll-mt-24">
        <CardHeader>
          <CardTitle className="text-base">{t('contractorAwards')}</CardTitle>
          <CardDescription>
            {contractSummary.roadRelatedAwards.toLocaleString('en-IN')} {t('roadLinkedAwards')} /{' '}
            {contractSummary.totalAwards.toLocaleString('en-IN')} {t('totalAwards')}. {t('contractorAwardsDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-2">
          <ChartPanel
            heightClass="h-72"
            hasData={contractorData.length > 0}
            emptyLabel="Dataset load failed: contract_awards CSV"
          >
            <BarChart data={contractorData}>
              <CartesianGrid strokeDasharray="3 3" style={gridStyle} />
              <XAxis dataKey="contractor" tick={axisStyle} interval={0} angle={-25} textAnchor="end" height={70} />
              <YAxis tick={axisStyle} />
              <Tooltip {...chartTooltipStyle} />
              <Bar dataKey="valueInr" fill="#a855f7" name="Award value (INR)" />
            </BarChart>
          </ChartPanel>
          <ChartPanel
            heightClass="h-72"
            hasData={procurementData.length > 0}
            emptyLabel="Dataset load failed: contract_awards CSV"
          >
            <PieChart>
              <Pie data={procurementData} dataKey="count" nameKey="method" outerRadius={100}>
                {procurementData.map((entry) => (
                  <Cell key={entry.method} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip {...chartTooltipStyle} />
              <Legend />
            </PieChart>
          </ChartPanel>
        </CardContent>
      </Card>
    </div>
  )
}
