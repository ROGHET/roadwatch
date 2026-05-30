import { AlertCircle, Bot, Loader2, MapPin, Plus, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AssistantChatPanel } from '../../components/assistant/AssistantChatPanel'
import { Badge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/common/Card'
import { EmptyState } from '../../components/common/EmptyState'
import { Input } from '../../components/common/Input'
import { Label } from '../../components/common/Label'
import { PageContainer } from '../../components/common/PageContainer'
import { SectionHeader } from '../../components/common/SectionHeader'
import { Textarea } from '../../components/common/Textarea'
import { RtiGenerationModal } from '../../components/rti/RtiGenerationModal'
import { assistantPageCopy, assistantSamplePrompt, assistantSuggestedQuestions, assistantSystemKnowledge } from '../../data/assistant'
import { mockComplaintRecords } from '../../data/complaints'
import { mockRoads } from '../../data/roads'
import {
  augmentPromptWithComplaintContext,
  buildComplaintContextBlock,
} from '../../lib/complaints/complaintContext'
import {
  resolveComplaintById,
  type ResolvedComplaintDetail,
} from '../../lib/complaints/resolveComplaint'
import { useI18n } from '../../lib/i18n'
import { routes } from '../../lib/routes'
import { useAssistantChatStore } from '../../stores/assistantChatStore'
import { useComplaintStore } from '../../stores/complaintStore'
import { useMapStore } from '../../stores/mapStore'

type AssistantContext =
  | { type: 'generic' }
  | {
      type: 'road'
      roadId: string
    }
  | {
      type: 'complaint'
      complaintId: string
    }
  | {
      type: 'location'
      latitude: number
      longitude: number
      label?: string
      city?: string
      state?: string
    }
  | {
      type: 'manual-location'
      query: string
      label: string
      city: string
      state: string
      latitude?: number
      longitude?: number
    }

type GeocodedLocation = {
  label: string
  city: string
  state: string
}

const quotaFallbackNotice = [
  'AI response unavailable.',
  '',
  'The configured Gemini API quota or rate limit has been exhausted.',
  '',
  'The answer below was generated using CrashZero offline assistance and may not contain live project-specific information.',
].join('\n')

const rtiGuidance = [
  'RTI stands for Right to Information. It lets citizens request information held by a public authority under the RTI Act, 2005.',
  '',
  'How to file an RTI:',
  '1. Identify the public authority that holds the records.',
  '2. Address the request to the Public Information Officer.',
  '3. Ask for specific records, dates, budgets, inspection reports, work orders, or complaint action taken reports.',
  '4. Pay the prescribed application fee, commonly Rs. 10 unless an exemption applies.',
  '5. Submit online where available, or by post/in person to the authority.',
  '',
  'Timelines:',
  '1. Standard response time is 30 days.',
  '2. Life or liberty matters should be answered within 48 hours.',
  '3. If transferred to another authority, the transfer should generally happen within 5 days.',
  '',
  'Escalation:',
  '1. File a first appeal if no reply arrives on time or the reply is incomplete.',
  '2. File a second appeal or complaint with the Information Commission if the first appeal is unresolved.',
].join('\n')

const knownManualLocations = [
  {
    matcher: /jabalpur/i,
    label: 'Jabalpur, Madhya Pradesh, India',
    city: 'Jabalpur',
    state: 'Madhya Pradesh',
    latitude: 23.168,
    longitude: 79.931,
  },
  {
    matcher: /indore/i,
    label: 'Indore, Madhya Pradesh, India',
    city: 'Indore',
    state: 'Madhya Pradesh',
    latitude: 22.7196,
    longitude: 75.8577,
  },
  {
    matcher: /mumbai/i,
    label: 'Mumbai, Maharashtra, India',
    city: 'Mumbai',
    state: 'Maharashtra',
    latitude: 19.076,
    longitude: 72.8777,
  },
  {
    matcher: /pune/i,
    label: 'Pune, Maharashtra, India',
    city: 'Pune',
    state: 'Maharashtra',
    latitude: 18.5204,
    longitude: 73.8567,
  },
] as const

const stateAliases: Record<string, string> = {
  mp: 'Madhya Pradesh',
  'madhya pradesh': 'Madhya Pradesh',
  mh: 'Maharashtra',
  maharashtra: 'Maharashtra',
}

const offlineKnowledge = [
  {
    matcher: /^ *(hello|hi|hey)[!. ]*$/i,
    answer:
      'Hello! I am CrashZero AI. I can help with road issues, complaint filing, map navigation, RTI drafts, and general road-safety questions.',
  },
  {
    matcher: /theme|dark mode|light mode|appearance/i,
    answer:
      'Open Settings from the profile menu or command palette (Ctrl+K). Choose Theme to switch dark, light, or system mode. You can also run "Dark Mode" or "Light Mode" from the command palette.',
  },
  {
    matcher: /language|hindi|english|translate/i,
    answer:
      'Change language from Settings > Language, the Language page, or the command palette. CrashZero supports English and Hindi.',
  },
  {
    matcher: /settings|preferences|configuration/i,
    answer:
      'Open Settings from the profile menu or command palette. Settings includes theme, language, and accessibility options such as font size.',
  },
  {
    matcher: /accessibility|font size|text size/i,
    answer:
      'Accessibility options are in Settings. Adjust font size to small, medium, or large for easier reading.',
  },
  {
    matcher: /dashboard|overview|metrics/i,
    answer:
      'Open Dashboard from the top navigation dashboard icon or command palette. The dashboard summarizes complaint volume, severity, and recent activity.',
  },
  {
    matcher: /open map|map tab|where is the map/i,
    answer:
      'Open the Map from the bottom navigation Map icon, Home quick actions, or command palette. Tap the map to inspect location intelligence and file complaints.',
  },
  {
    matcher: /file a complaint|submit complaint|report issue|track complaint/i,
    answer:
      'Open Complaint from the navigation Complaint tab or command palette. Fill road type, issue type, location, and description, then submit. Track status with your complaint ID on the same page.',
  },
  {
    matcher: /\brti\b|right to information/i,
    answer: rtiGuidance,
  },
  {
    matcher: /what\s+is\s+a?\s*pothole|pothole/i,
    answer:
      'A pothole is a bowl-shaped break in a road surface. It usually forms when water enters cracks, weakens the layers below, and traffic repeatedly presses on the damaged area until pieces of pavement loosen.',
  },
  {
    matcher: /what\s+causes\s+road\s+damage|road\s+damage/i,
    answer:
      'Road damage is commonly caused by water infiltration, heavy axle loads, poor drainage, weak sub-base layers, temperature changes, utility cuts, and delayed maintenance.',
  },
  {
    matcher: /what\s+is\s+asphalt|asphalt/i,
    answer:
      'Asphalt is a road-building material made from aggregates such as stone and sand bound together with bitumen. It is flexible, repairable, and widely used for urban roads and highways.',
  },
  {
    matcher: /what\s+is\s+road\s+maintenance|road\s+maintenance/i,
    answer:
      'Road maintenance is the planned upkeep of roads through inspections, pothole patching, resurfacing, drainage cleaning, line marking, streetlight repair, and safety improvements.',
  },
] as const

function formatCoord(value: number) {
  return value.toFixed(3)
}

function isRtiQuestion(text: string) {
  return /\brti\b|right to information|generate\s+.*request|file\s+.*rti|rti\s+(process|fees?|timelines?|appeal)/i.test(text)
}

function isQuotaOrTransportFailure(text?: string) {
  if (!text) return false
  return /failed to fetch|network error|quota|rate limit|429|resource exhausted|too many requests/i.test(text)
}

function normalizeText(value: string) {
  return value.trim().toLowerCase().replace(/\./g, '').replace(/\s+/g, ' ')
}

function resolveLocalCity(input: string) {
  const parts = input.split(',').map((part) => normalizeText(part)).filter(Boolean)
  const normalizedInput = normalizeText(input)

  return knownManualLocations.find((location) => {
    const city = normalizeText(location.city)
    const state = normalizeText(location.state)
    const statePart = parts[1] ? stateAliases[parts[1]] : undefined
    const stateMatches =
      !parts[1] || (normalizeText(statePart ?? parts[1]) === state)
    const countryMatches = !parts[2] || /india|in/.test(parts[2])

    return (
      (parts[0] === city || normalizedInput.includes(city)) &&
      stateMatches &&
      countryMatches
    )
  })
}

function getOfflineAnswer(promptText: string) {
  if (isRtiQuestion(promptText)) return rtiGuidance
  return offlineKnowledge.find((entry) => entry.matcher.test(promptText))?.answer ?? null
}

function isProjectSpecificQuestion(promptText: string) {
  return /budget|spent|contractor|authority|complaint\s+(count|statistics|stats)|project-specific|records?|work order|inspection report/i.test(promptText)
}

function stateComplaintStatus(value: unknown): ResolvedComplaintDetail['status'] {
  if (
    value === 'routed' ||
    value === 'in_review' ||
    value === 'resolved' ||
    value === 'rejected'
  ) {
    return value
  }
  return 'pending'
}

function stateComplaintSeverity(
  value: unknown,
): ResolvedComplaintDetail['severity'] | undefined {
  if (
    value === 'low' ||
    value === 'medium' ||
    value === 'high' ||
    value === 'critical'
  ) {
    return value
  }
  return undefined
}

function formatComplaintStatus(status: string): string {
  return status
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function isComplaintResolved(status: string, resolutionStatus?: string): boolean {
  return (
    status.toLowerCase() === 'resolved' ||
    resolutionStatus?.toLowerCase() === 'resolved'
  )
}

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export default function AssistantPage() {
  const { t } = useI18n()
  const location = useLocation()
  const navigate = useNavigate()
  const selection = useMapStore((state) => state.selection)
  const submittedComplaints = useComplaintStore((state) => state.submittedComplaints)

  const initialContext = useMemo<AssistantContext>(() => {
    const state = (location.state ?? {}) as Partial<Record<string, unknown>>

    if (state.contextType === 'road' && typeof state.roadId === 'string') {
      return { type: 'road', roadId: state.roadId }
    }

    if (state.contextType === 'complaint' && typeof state.complaintId === 'string') {
      return { type: 'complaint', complaintId: state.complaintId }
    }

    if (
      state.contextType === 'location' &&
      typeof state.latitude === 'number' &&
      typeof state.longitude === 'number'
    ) {
      return { type: 'location', latitude: state.latitude, longitude: state.longitude }
    }

    if (selection?.kind === 'road') {
      return { type: 'road', roadId: selection.road.id }
    }

    if (selection?.kind === 'complaint') {
      return { type: 'complaint', complaintId: selection.complaint.id }
    }

    if (selection?.kind === 'location') {
      return { type: 'location', latitude: selection.lat, longitude: selection.lng }
    }

    return { type: 'generic' }
  }, [location.state, selection])

  const [activeContext, setActiveContext] = useState<AssistantContext>(initialContext)
  const [manualRoadName, setManualRoadName] = useState('')
  const [showContextForm, setShowContextForm] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [rtiModalOpen, setRtiModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [geocodedLocation, setGeocodedLocation] = useState<GeocodedLocation | null>(null)
  const addMessage = useAssistantChatStore((state) => state.addMessage)
  const clearMessages = useAssistantChatStore((state) => state.clearMessages)
  const messages = useAssistantChatStore((state) => state.messages)

  useEffect(() => {
    setActiveContext(initialContext)
  }, [initialContext])

  const activeRoad = useMemo(() => {
    if (activeContext.type !== 'road') return null
    return mockRoads.find((road) => road.id === activeContext.roadId) ?? null
  }, [activeContext])

  const activeComplaint = useMemo(() => {
    if (activeContext.type !== 'complaint') return null

    const state = (location.state ?? {}) as Partial<Record<string, unknown>>
    const complaintKey =
      typeof state.complaintId === 'string'
        ? state.complaintId
        : typeof state.referenceId === 'string'
          ? state.referenceId
          : activeContext.complaintId

    const resolved = resolveComplaintById(complaintKey, submittedComplaints)
    if (resolved) return resolved

    const mock = mockComplaintRecords.find((complaint) => complaint.id === complaintKey)
    if (mock) {
      return {
        id: mock.id,
        referenceId: mock.referenceId,
        roadId: mock.roadId,
        title: mock.title,
        description: mock.description ?? '',
        roadName: mock.roadName,
        city: mock.city,
        state: 'Tamil Nadu',
        lat: mock.lat,
        lng: mock.lng,
        roadType: mock.roadType,
        issueType: mock.issueType,
        assignedAuthority: mock.assignedAuthority,
        assignedDepartment: mock.assignedDepartment,
        status: mock.status,
        severity: mock.severity,
        reportedAt: mock.reportedAt,
        updatedAt: mock.updatedAt,
        resolutionStatus: mock.resolutionStatus,
        citizenReports: mock.citizenReports,
        maintenanceReports: mock.maintenanceReports,
      }
    }

    if (
      typeof state.issueType === 'string' ||
      typeof state.description === 'string' ||
      typeof state.latitude === 'number'
    ) {
      return {
        id: complaintKey,
        referenceId: typeof state.referenceId === 'string' ? state.referenceId : complaintKey,
        roadId: typeof state.roadId === 'string' ? state.roadId : 'unknown',
        title: typeof state.location === 'string' ? state.location : 'Complaint context',
        description: typeof state.description === 'string' ? state.description : '',
        roadName: typeof state.roadName === 'string' ? state.roadName : undefined,
        city: 'Not Available',
        state: 'Not Available',
        lat: typeof state.latitude === 'number' ? state.latitude : 0,
        lng: typeof state.longitude === 'number' ? state.longitude : 0,
        issueType: typeof state.issueType === 'string' ? state.issueType : undefined,
        assignedAuthority: typeof state.authority === 'string' ? state.authority : undefined,
        assignedDepartment:
          typeof state.assignedDepartment === 'string' ? state.assignedDepartment : undefined,
        status: stateComplaintStatus(state.status),
        severity: stateComplaintSeverity(state.severity),
        resolutionStatus:
          typeof state.resolutionStatus === 'string' ? state.resolutionStatus : undefined,
        citizenReports: undefined,
        maintenanceReports: undefined,
        reportedAt: undefined,
        updatedAt: undefined,
        locationLabel: typeof state.location === 'string' ? state.location : undefined,
      }
    }

    return null
  }, [activeContext, location.state, submittedComplaints])

  const activeLocation = useMemo(() => {
    if (activeContext.type === 'location') return activeContext
    if (
      activeContext.type === 'manual-location' &&
      typeof activeContext.latitude === 'number' &&
      typeof activeContext.longitude === 'number'
    ) {
      return { latitude: activeContext.latitude, longitude: activeContext.longitude }
    }
    return null
  }, [activeContext])

  useEffect(() => {
    let cancelled = false

    async function resolveLocation() {
      if (activeContext.type === 'manual-location') {
        setGeocodedLocation({
          label: activeContext.label,
          city: activeContext.city,
          state: activeContext.state,
        })
        return
      }

      if (activeContext.type === 'location' && (activeContext.label || activeContext.city || activeContext.state)) {
        setGeocodedLocation({
          label:
            activeContext.label ||
            activeContext.city ||
            `Coordinates: ${formatCoord(activeContext.latitude)}, ${formatCoord(activeContext.longitude)}`,
          city: activeContext.city || 'Not Available',
          state: activeContext.state || 'Not Available',
        })
        return
      }

      if (!activeLocation) {
        setGeocodedLocation(null)
        return
      }

      try {
        const response = await fetch(
          `${apiBaseUrl}/api/intelligence/geocode?lat=${activeLocation.latitude}&lng=${activeLocation.longitude}`,
        )
        if (!response.ok) throw new Error('Geocode failed')
        const payload = (await response.json()) as { city?: string; state?: string; label?: string }
        if (cancelled) return

        setGeocodedLocation({
          label:
            payload.label ||
            payload.city ||
            `${formatCoord(activeLocation.latitude)}, ${formatCoord(activeLocation.longitude)}`,
          city: payload.city || 'Not Available',
          state: payload.state || 'Not Available',
        })
      } catch {
        if (cancelled) return
        setGeocodedLocation({
          label: `Coordinates: ${formatCoord(activeLocation.latitude)}, ${formatCoord(activeLocation.longitude)}`,
          city: 'Not Available',
          state: 'Not Available',
        })
      }
    }

    void resolveLocation()
    return () => {
      cancelled = true
    }
  }, [activeContext, activeLocation])

  const activeContextSummary = useMemo(() => {
    if (activeRoad) {
      const complaintCount = mockComplaintRecords.filter((complaint) => complaint.roadId === activeRoad.id).length
      return {
        type: 'road' as const,
        title: activeRoad.roadName,
        details: [
          ['Authority', activeRoad.authority || 'Unknown'],
          ['Contractor', activeRoad.contractor || 'Unknown'],
          ['Budget', activeRoad.budgetHistory?.[0]?.sanctioned || 'Not Available'],
          ['Spent', activeRoad.budgetHistory?.[0]?.spent || 'Not Available'],
          ['Complaint count', complaintCount > 0 ? String(complaintCount) : 'No Data'],
        ],
      }
    }

    if (activeComplaint) {
      const locationLine =
        activeComplaint.locationLabel ??
        [activeComplaint.city, activeComplaint.state].filter(Boolean).join(', ')
      return {
        type: 'complaint' as const,
        title: activeComplaint.title,
        details: [
          ['Complaint ID', activeComplaint.referenceId],
          ['Issue type', activeComplaint.issueType || 'Unknown'],
          ['Description', activeComplaint.description || 'Not Available'],
          ['Coordinates', `${formatCoord(activeComplaint.lat)}, ${formatCoord(activeComplaint.lng)}`],
          ['Location', locationLine || 'Not Available'],
          ['Authority', activeComplaint.assignedAuthority || 'Unknown'],
          ['Severity', activeComplaint.severity || 'Unknown'],
          ['Status', activeComplaint.status || 'Unknown'],
          ['Resolution', activeComplaint.resolutionStatus || 'Not Available'],
        ],
      }
    }

    if (activeLocation) {
      const isManualLocation = activeContext.type === 'manual-location'
      return {
        type: isManualLocation ? ('manual-location' as const) : ('location' as const),
        title: geocodedLocation?.label ?? `Coordinates: ${formatCoord(activeLocation.latitude)}, ${formatCoord(activeLocation.longitude)}`,
        details: [
          ['Latitude', formatCoord(activeLocation.latitude)],
          ['Longitude', formatCoord(activeLocation.longitude)],
          ['City', geocodedLocation?.city ?? 'Not Available'],
          ['State', geocodedLocation?.state ?? 'Not Available'],
        ],
      }
    }

    if (activeContext.type === 'manual-location') {
      return {
        type: 'manual-location' as const,
        title: activeContext.label,
        details: [
          ['City', activeContext.city],
          ['State', activeContext.state],
          ['Coordinates', 'Not Available'],
        ],
      }
    }

    return {
      type: 'generic' as const,
      title: 'Generic assistance',
      details: [
        ['Road', 'No Data'],
        ['Complaint', 'No Data'],
        ['Location', 'No Data'],
      ],
    }
  }, [activeComplaint, activeContext, activeLocation, activeRoad, geocodedLocation])

  const systemPrompt = useMemo(() => {
    const contextLines = activeContextSummary.details.map(([label, value]) => `${label}: ${value}`).join('\n')
    return [
      ...assistantSystemKnowledge,
      '',
      'Current active context:',
      `${activeContextSummary.title}`,
      contextLines,
      ...(activeComplaint ? ['', buildComplaintContextBlock(activeComplaint)] : []),
      '',
      'Rules:',
      'Answer the user question first in natural language.',
      'Use context as supporting evidence; never dump raw database fields as the main answer.',
      'Prioritize the selected road, complaint, or location before answering.',
      'If a value is unknown, say Unknown, Not Available, or No Data.',
      'Explain app navigation using the actual CrashZero navigation paths.',
    ].join('\n')
  }, [activeComplaint, activeContextSummary])

  const resolveQuotaFallback = (promptText: string) => {
    const fallback =
      buildGroundedContextResponse(promptText) ??
      getOfflineAnswer(promptText) ??
      (isProjectSpecificQuestion(promptText)
        ? 'I need an active road, complaint, or location context to answer project-specific records such as budgets, contractors, complaint statistics, or official maintenance records.'
        : 'I can still help with CrashZero navigation, RTI drafting, complaint filing, road-safety concepts, and general road maintenance questions.')

    setError(null)
    addMessage('assistant', `${quotaFallbackNotice}\n\n${fallback}`)
  }

  const buildGroundedContextResponse = (promptText: string) => {
    const normalized = promptText.toLowerCase()

    if (activeRoad && /(this road|condition|maintain|authority|contractor|budget|complaint|history|tell about|about this)/i.test(normalized)) {
      const complaintCount = mockComplaintRecords.filter((complaint) => complaint.roadId === activeRoad.id).length
      const latestBudget = activeRoad.budgetHistory?.[0]
      return [
        `${activeRoad.roadName} is currently marked as ${activeRoad.status.replace('_', ' ')} with a road health score of ${activeRoad.score}.`,
        '',
        `Authority: ${activeRoad.authority || 'Unknown'}`,
        `Contractor: ${activeRoad.contractor || 'Unknown'}`,
        `Budget sanctioned: ${latestBudget?.sanctioned || 'Not Available'}`,
        `Budget spent: ${latestBudget?.spent || 'Not Available'}`,
        `Complaint count: ${complaintCount > 0 ? complaintCount : 'No Data'}`,
        `Last repair: ${activeRoad.lastRepairDate || 'Not Available'}`,
        `Maintenance schedule: ${activeRoad.maintenanceSchedule || 'Not Available'}`,
        `Inspection due: ${activeRoad.inspectionDue || 'Not Available'}`,
      ].join('\n')
    }

    if (
      activeComplaint &&
      /(this complaint|this issue|complaint|severity|status|resolution|report|history|tell about|about this|when will|who is responsible|who handles|be fixed|current status|generate rti|rti for)/i.test(
        normalized,
      )
    ) {
      const locationLine =
        activeComplaint.locationLabel ??
        [activeComplaint.city, activeComplaint.state].filter(Boolean).join(', ')
      const issue = activeComplaint.issueType || 'road issue'
      const place = locationLine || activeComplaint.roadName || 'the selected location'
      const status = formatComplaintStatus(activeComplaint.status || 'pending')
      const resolved = isComplaintResolved(
        activeComplaint.status || 'pending',
        activeComplaint.resolutionStatus,
      )

      if (/who is responsible|who handles|authority|responsible/i.test(normalized)) {
        return [
          `This complaint is assigned to ${activeComplaint.assignedAuthority || 'the responsible road authority'}.`,
          activeComplaint.assignedDepartment
            ? `The handling department is ${activeComplaint.assignedDepartment}.`
            : 'The specific department is not available in the complaint record.',
        ].join('\n')
      }

      if (/what is this issue about|is it resolved|resolved|about this|this issue/i.test(normalized)) {
        return [
          `This complaint reports ${issue} near ${place}.`,
          '',
          resolved
            ? `Current status is ${status}, meaning it has been marked resolved.`
            : `Current status is ${status}, meaning it has not yet been resolved.`,
          activeComplaint.assignedAuthority
            ? `It is assigned to ${activeComplaint.assignedAuthority}.`
            : 'The responsible authority is not available in the complaint record.',
        ].join('\n')
      }

      return [
        `This complaint reports ${issue} near ${place}.`,
        '',
        `Complaint ID: ${activeComplaint.referenceId}`,
        `Authority: ${activeComplaint.assignedAuthority || 'Unknown'}`,
        `Status: ${status}`,
        `Severity: ${activeComplaint.severity || 'Unknown'}`,
      ].join('\n')
    }

    if (activeContextSummary.type === 'location' || activeContextSummary.type === 'manual-location') {
      if (/(this location|location|city|state|coordinates|where|tell about|about this)/i.test(normalized)) {
        return [
          `${activeContextSummary.title}`,
          '',
          ...activeContextSummary.details.map(([label, value]) => `${label}: ${value}`),
        ].join('\n')
      }
    }

    return null
  }

  const callAiEndpoint = async (promptText: string): Promise<string> => {
    setIsLoading(true)
    setError(null)

    const apiPrompt = augmentPromptWithComplaintContext(promptText, activeComplaint)

    try {
      const body = {
        prompt: apiPrompt,
        systemPrompt,
        contextComplaintId: activeComplaint?.referenceId,
        context: {
          type: activeContext.type,
          road: activeRoad
            ? {
                roadId: activeRoad.id,
                roadName: activeRoad.roadName,
                authority: activeRoad.authority || 'Unknown',
                contractor: activeRoad.contractor || 'Unknown',
                budgetSanctioned: activeRoad.budgetHistory?.[0]?.sanctioned || 'Not Available',
                budgetSpent: activeRoad.budgetHistory?.[0]?.spent || 'Not Available',
                complaintCount: mockComplaintRecords.filter((complaint) => complaint.roadId === activeRoad.id).length || 0,
              }
            : null,
          complaint: activeComplaint
            ? {
                complaintId: activeComplaint.referenceId,
                issueType: activeComplaint.issueType || 'Unknown',
                description: activeComplaint.description || 'Not Available',
                latitude: activeComplaint.lat,
                longitude: activeComplaint.lng,
                location:
                  (activeComplaint.locationLabel ??
                    [activeComplaint.city, activeComplaint.state].filter(Boolean).join(', ')) ||
                  'Not Available',
                authority: activeComplaint.assignedAuthority || 'Unknown',
                department: activeComplaint.assignedDepartment || 'Unknown',
                roadId: activeComplaint.roadId,
                roadName: activeComplaint.roadName ?? 'Unknown',
                severity: activeComplaint.severity || 'Unknown',
                status: activeComplaint.status || 'Unknown',
                resolutionStatus: activeComplaint.resolutionStatus || 'Not Available',
                citizenReports: activeComplaint.citizenReports ?? 'No Data',
                maintenanceReports: activeComplaint.maintenanceReports ?? 'No Data',
              }
            : null,
          location: activeLocation
            ? {
                latitude: activeLocation.latitude,
                longitude: activeLocation.longitude,
                label: geocodedLocation?.label ?? `Coordinates: ${formatCoord(activeLocation.latitude)}, ${formatCoord(activeLocation.longitude)}`,
                city: geocodedLocation?.city ?? 'Not Available',
                state: geocodedLocation?.state ?? 'Not Available',
              }
            : null,
          appNavigation: [
            'Home',
            'Map',
            'Complaint',
            'Dashboard',
            'AI',
            'Settings > Language',
            'Road details',
            'Complaint details',
          ],
        },
      }

      const res = await fetch(`${apiBaseUrl}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        resolveQuotaFallback(apiPrompt)
        return ''
      }

      const data = (await res.json()) as { response?: string }
      if (isQuotaOrTransportFailure(data.response)) {
        resolveQuotaFallback(apiPrompt)
        return ''
      }

      const groundedFallback = buildGroundedContextResponse(promptText)
      const offlineFallback = getOfflineAnswer(promptText)
      if (
        (groundedFallback || offlineFallback) &&
        /no specific data|do not have specific data|database at this time|data was found/i.test(data.response ?? '')
      ) {
        return groundedFallback ?? offlineFallback ?? quotaFallbackNotice
      }

      return data.response ?? groundedFallback ?? offlineFallback ?? quotaFallbackNotice
    } catch {
      resolveQuotaFallback(promptText)
      return ''
    } finally {
      setIsLoading(false)
    }
  }

  const handleSend = async () => {
    if (!prompt.trim() || isLoading) return
    setError(null)
    const promptText = prompt.trim()
    addMessage('user', promptText)
    setPrompt('')

    const groundedResponse = buildGroundedContextResponse(promptText)
    if (groundedResponse) {
      addMessage('assistant', groundedResponse)
      return
    }

    const offlineAnswer = getOfflineAnswer(promptText)
    if (offlineAnswer) {
      addMessage('assistant', offlineAnswer)
      return
    }

    if (isProjectSpecificQuestion(promptText) && activeContext.type === 'generic') {
      addMessage(
        'assistant',
        'I need an active road, complaint, or location context to answer project-specific records such as budgets, contractors, complaint statistics, or official maintenance records.',
      )
      return
    }

    const aiResponse = await callAiEndpoint(promptText)
    if (aiResponse) {
      addMessage('assistant', aiResponse)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSuggestedClick = (question: string) => {
    setPrompt(question)
  }

  const handleContextSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const roadName = String(formData.get('roadName') ?? '').trim()
    if (!roadName) return

    const road = mockRoads.find(
      (candidate) =>
        candidate.roadName.toLowerCase().includes(roadName.toLowerCase()) ||
        candidate.id.toLowerCase() === roadName.toLowerCase(),
    )

    if (road) {
      setActiveContext({ type: 'road', roadId: road.id })
      setShowContextForm(false)
      setManualRoadName('')
      return
    }

    const knownLocation = resolveLocalCity(roadName)
    if (knownLocation) {
      setActiveContext({
        type: 'location',
        latitude: knownLocation.latitude,
        longitude: knownLocation.longitude,
        label: knownLocation.label,
        city: knownLocation.city,
        state: knownLocation.state,
      })
      setGeocodedLocation({
        label: knownLocation.label,
        city: knownLocation.city,
        state: knownLocation.state,
      })
      setShowContextForm(false)
      setManualRoadName('')
      return
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/intelligence/geocode?q=${encodeURIComponent(roadName)}`)
      if (!response.ok) throw new Error('Geocode failed')
      const payload = (await response.json()) as {
        label?: string
        city?: string
        state?: string
        latitude?: number
        longitude?: number
        lat?: number
        lng?: number
      }
      const latitude = payload.latitude ?? payload.lat
      const longitude = payload.longitude ?? payload.lng
      if (typeof latitude === 'number' && typeof longitude === 'number') {
        setActiveContext({
          type: 'location',
          latitude,
          longitude,
          label: payload.label || roadName,
          city: payload.city || 'Not Available',
          state: payload.state || 'Not Available',
        })
        setGeocodedLocation({
          label: payload.label || roadName,
          city: payload.city || 'Not Available',
          state: payload.state || 'Not Available',
        })
      } else {
        setActiveContext({
          type: 'manual-location',
          query: roadName,
          label: payload.label || roadName,
          city: payload.city || 'Not Available',
          state: payload.state || 'Not Available',
        })
      }
    } catch {
      setActiveContext({
        type: 'manual-location',
        query: roadName,
        label: roadName,
        city: 'Not Available',
        state: 'Not Available',
      })
    }

    setShowContextForm(false)
    setManualRoadName('')
  }

  const clearContext = () => {
    setActiveContext({ type: 'generic' })
    setGeocodedLocation(null)
    navigate(routes.assistant, { replace: true, state: {} })
  }

  const defaultRtiAuthority =
    activeRoad?.authority ||
    activeComplaint?.assignedAuthority ||
    activeContextSummary.details.find(([label]) => label === 'Authority')?.[1] ||
    'NHAI'

  const defaultRtiInformation = activeComplaint
    ? `Certified copies of records, inspections, work orders, and action taken reports related to ${activeComplaint.title}.`
    : `Certified copies of records, inspections, work orders, and action taken reports related to ${activeContextSummary.title}.`

  const contextTitle =
    activeContextSummary.type === 'generic' ? t('assistantContextLabel') : activeContextSummary.title
  const contextTypeLabel =
    activeContextSummary.type === 'manual-location'
      ? 'Location (Manual)'
      : activeContextSummary.type === 'generic'
        ? 'Generic'
        : activeContextSummary.type[0].toUpperCase() + activeContextSummary.type.slice(1)

  return (
    <PageContainer size="default" className="gap-6">
      <SectionHeader title={t('aiTitle')} description={assistantPageCopy.description} />

      <Card className="border-[var(--rw-border-strong)] bg-[var(--rw-surface-muted)]">
        <CardHeader className="flex flex-col gap-4 pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-sm">
              <MapPin className="size-4 text-[var(--rw-primary)]" />
              {t('assistantContextLabel')}
            </CardTitle>
            <CardDescription>
              {activeContext.type === 'generic'
                ? 'No active context selected.'
                : 'Selected context will be injected into every AI request.'}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowContextForm((open) => !open)}>
              <Plus className="mr-2 size-3" />
              {showContextForm ? 'Cancel' : 'Add Context'}
            </Button>
            <Button variant="outline" size="sm" onClick={clearContext} disabled={activeContext.type === 'generic'}>
              Clear Context
            </Button>
          </div>
        </CardHeader>

        {showContextForm ? (
          <div className="px-6 pb-4">
            <form onSubmit={handleContextSubmit} className="flex flex-col gap-3 rounded-md border border-[var(--rw-border)] bg-[var(--rw-surface)] p-4">
              <p className="text-sm text-[var(--rw-text-secondary)]">
                Search for a road name or enter a city, state, country to set the assistant context.
              </p>
              <div className="flex items-center gap-2">
                <Search className="size-4 text-[var(--rw-text-tertiary)]" />
                <div className="flex-1 space-y-1">
                  <Label htmlFor="assistant-road-name" className="sr-only">
                    Road name
                  </Label>
                  <Input
                    id="assistant-road-name"
                    name="roadName"
                    value={manualRoadName}
                    onChange={(event) => setManualRoadName(event.target.value)}
                    placeholder="E.g. Sardar Patel Road or Jabalpur, Madhya Pradesh, India"
                  />
                </div>
              </div>
              <Button type="submit" size="sm" className="w-fit mt-2">
                Confirm Context
              </Button>
            </form>
          </div>
        ) : null}

        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-xs md:grid-cols-4">
            <div>
              <p className="mb-1 font-medium text-[var(--rw-text-tertiary)]">Context Type</p>
              <p className="text-[var(--rw-text-primary)]">{contextTypeLabel}</p>
            </div>

            <div className="col-span-2 md:col-span-3">
              <p className="mb-1 font-medium text-[var(--rw-text-tertiary)]">Selected Context</p>
              <p className="truncate text-[var(--rw-text-primary)]">{contextTitle}</p>
            </div>

            {activeContextSummary.details.map(([label, value]) => (
              <div key={label}>
                <p className="mb-1 font-medium text-[var(--rw-text-tertiary)]">{label}</p>
                <p className="truncate text-[var(--rw-text-primary)]">{value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 aspect-square items-center justify-center rounded-lg border border-[var(--rw-border)] bg-[var(--rw-surface-muted)] sm:h-11 sm:w-11" aria-hidden="true">
              <Bot className="size-5 text-[var(--rw-text-secondary)]" />
            </div>
            <div>
              <CardTitle className="text-base">{t('aiAssistant')}</CardTitle>
              <CardDescription>Powered by Gemini and grounded in the current app context.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {messages.length === 0 && !isLoading && !error ? (
            <EmptyState icon={AlertCircle} title={t('assistantEmptyTitle')} description={t('assistantEmptyDescription')} className="py-8" />
          ) : null}

          <AssistantChatPanel isLoading={isLoading} />

          {error ? (
            <div className="flex items-center rounded-md border border-[var(--rw-danger)]/30 bg-[var(--rw-danger)]/10 p-3 text-sm text-[var(--rw-danger)]">
              <AlertCircle className="mr-2 size-5 shrink-0" />
              {error}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {assistantSuggestedQuestions.map((question) => (
              <Badge
                key={question}
                variant="outline"
                className="cursor-pointer px-3 py-1.5 hover:bg-[var(--rw-surface-raised)]"
                onClick={() => handleSuggestedClick(question)}
              >
                {question}
              </Badge>
            ))}
          </div>

          <Textarea
            id="assistant-prompt"
            placeholder={assistantSamplePrompt}
            rows={4}
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
        </CardContent>
        <CardFooter className="flex flex-wrap gap-3">
          <Button type="button" onClick={() => void handleSend()} disabled={isLoading || !prompt.trim()}>
            {isLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            {t('sendMessage')}
          </Button>
          <Button type="button" variant="outline" onClick={() => setRtiModalOpen(true)} disabled={isLoading}>
            {t('generateRti')}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={clearMessages}
            disabled={isLoading || messages.length === 0}
          >
            Clear Chat
          </Button>
        </CardFooter>
      </Card>

      <RtiGenerationModal
        open={rtiModalOpen}
        onClose={() => setRtiModalOpen(false)}
        defaultAuthority={defaultRtiAuthority}
        defaultInformation={defaultRtiInformation}
      />
    </PageContainer>
  )
}
