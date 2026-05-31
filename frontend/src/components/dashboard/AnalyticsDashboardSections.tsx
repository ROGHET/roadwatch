import type { ReactNode } from 'react'
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
  getComplaintIssueChartData,
  getContractorValueChartData,
  getProcurementChartData,
  getRiskHotspotChartData,
  getRoadContractSummary,
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
    <div className={`w-full ${heightClass}`}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  )
}

export function AnalyticsDashboardSections() {
  const { t } = useI18n()
  const accidentData = getAccidentChartData()
  const complaintData = getComplaintIssueChartData()
  const budgetData = getBudgetTrendChartData()
  const tenderData = getTenderComplianceChartData()
  const hotspotData = getRiskHotspotChartData()
  const contractorData = getContractorValueChartData()
  const procurementData = getProcurementChartData()
  const tollAnalytics = getTollAnalytics()
  const contractSummary = getRoadContractSummary()

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
              <Tooltip contentStyle={{ background: 'var(--rw-surface)', border: '1px solid var(--rw-border)' }} />
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
              <Tooltip contentStyle={{ background: 'var(--rw-surface)', border: '1px solid var(--rw-border)' }} />
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
              <Tooltip contentStyle={{ background: 'var(--rw-surface)', border: '1px solid var(--rw-border)' }} />
              <Legend />
            </PieChart>
          </ChartPanel>
        </CardContent>
      </Card>

      <Card className="rw-glass-panel rw-glass-edge lg:col-span-2">
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
              <Tooltip contentStyle={{ background: 'var(--rw-surface)', border: '1px solid var(--rw-border)' }} />
              <Legend />
              <Line type="monotone" dataKey="sanctioned" stroke="#38bdf8" name={t('sanctioned')} />
              <Line type="monotone" dataKey="released" stroke="#22c55e" name={t('released')} />
              <Line type="monotone" dataKey="remaining" stroke="#f59e0b" name={t('remaining')} />
            </LineChart>
          </ChartPanel>
        </CardContent>
      </Card>

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
              <Tooltip contentStyle={{ background: 'var(--rw-surface)', border: '1px solid var(--rw-border)' }} />
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
            <BarChart data={tollAnalytics.byState}>
              <CartesianGrid strokeDasharray="3 3" style={gridStyle} />
              <XAxis dataKey="state" tick={axisStyle} />
              <YAxis tick={axisStyle} />
              <Tooltip contentStyle={{ background: 'var(--rw-surface)', border: '1px solid var(--rw-border)' }} />
              <Bar dataKey="count" name={t('tollPlazas')}>
                {tollAnalytics.byState.map((entry) => (
                  <Cell key={entry.state} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ChartPanel>
        </CardContent>
      </Card>

      <Card className="rw-glass-panel rw-glass-edge lg:col-span-2">
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
              <Tooltip contentStyle={{ background: 'var(--rw-surface)', border: '1px solid var(--rw-border)' }} />
              <Bar dataKey="valueMillionUsd" fill="#a855f7" name={t('awardValueUsd')} />
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
              <Tooltip contentStyle={{ background: 'var(--rw-surface)', border: '1px solid var(--rw-border)' }} />
              <Legend />
            </PieChart>
          </ChartPanel>
        </CardContent>
      </Card>
    </div>
  )
}
