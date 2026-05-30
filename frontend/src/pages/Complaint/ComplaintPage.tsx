import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Alert } from '../../components/common/Alert'
import { Button } from '../../components/common/Button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/common/Card'
import { Input } from '../../components/common/Input'
import { Label } from '../../components/common/Label'
import { PageContainer } from '../../components/common/PageContainer'
import { SectionHeader } from '../../components/common/SectionHeader'
import { Select } from '../../components/common/Select'
import { Textarea } from '../../components/common/Textarea'
import { ComplaintPhotoField } from '../../components/complaints/ComplaintPhotoField'
import { ComplaintSubmissionSuccess } from '../../components/complaints/ComplaintSubmissionSuccess'
import { TrackComplaintSection } from '../../components/complaints/TrackComplaintSection'
import { complaintSeverityOptions } from '../../data/complaints'
import { useGeolocation } from '../../hooks/useGeolocation'
import {
  normalizeIssueTypeForForm,
  submitComplaint,
  type ComplaintRoutingResult,
} from '../../lib/api/complaints'
import {
  COMPLAINT_ISSUE_TYPE_OPTIONS,
  ROAD_TYPE_OPTIONS,
  type RoadType,
} from '../../lib/complaintRouting'
import { inferPlaceFromCoordinates } from '../../lib/map/inferPlace'
import { useI18n } from '../../lib/i18n'
import { routes } from '../../lib/routes'
import { useComplaintStore } from '../../stores/complaintStore'

const defaultLatitude = '12.9716'
const defaultLongitude = '80.2421'

export type ComplaintFormPrefill = {
  lat: number
  lng: number
  issueType?: string
  roadId?: string
  roadName?: string
  title?: string
  locationLabel?: string
  city?: string
  state?: string
}

function isComplaintFormPrefill(value: unknown): value is ComplaintFormPrefill {
  if (!value || typeof value !== 'object') return false
  const candidate = value as ComplaintFormPrefill
  return typeof candidate.lat === 'number' && typeof candidate.lng === 'number'
}

function applyDraftToForm(
  draft: NonNullable<ReturnType<typeof useComplaintStore.getState>['draft']>,
  setters: {
    setRoadType: (value: RoadType) => void
    setIssueType: (value: string) => void
    setSeverity: (value: string) => void
    setDescription: (value: string) => void
    setLatitude: (value: string) => void
    setLongitude: (value: string) => void
    setLocationLabel: (value: string) => void
    setCity: (value: string) => void
    setState: (value: string) => void
    setRoadId: (value: string | undefined) => void
    setRoadName: (value: string | undefined) => void
    setPhotoPreview: (value: string | null) => void
  },
) {
  setters.setRoadType(draft.roadType)
  setters.setIssueType(draft.issueType)
  setters.setSeverity(draft.severity)
  setters.setDescription(draft.description)
  setters.setLatitude(draft.latitude)
  setters.setLongitude(draft.longitude)
  setters.setLocationLabel(draft.locationLabel ?? '')
  setters.setCity(draft.city ?? '')
  setters.setState(draft.state ?? '')
  setters.setRoadId(draft.roadId)
  setters.setRoadName(draft.roadName)
  setters.setPhotoPreview(draft.photoDataUrl ?? null)
}

export default function ComplaintPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()
  const successRef = useRef<HTMLElement>(null)
  const trackSectionRef = useRef<HTMLDivElement>(null)

  const draft = useComplaintStore((state) => state.draft)
  const saveDraftToStore = useComplaintStore((state) => state.saveDraft)
  const clearDraft = useComplaintStore((state) => state.clearDraft)
  const addSubmittedComplaint = useComplaintStore((state) => state.addSubmittedComplaint)
  const pickedLocation = useComplaintStore((state) => state.pickedLocation)
  const clearPickedLocation = useComplaintStore((state) => state.clearPickedLocation)
  const requestComplaintLocationPick = useComplaintStore((state) => state.requestComplaintLocationPick)
  const updateDraftLocation = useComplaintStore((state) => state.updateDraftLocation)
  const resetComplaintForm = useComplaintStore((state) => state.resetComplaintForm)

  const { position, locate, status: geoStatus } = useGeolocation()

  const [roadType, setRoadType] = useState<RoadType>('NH')
  const [issueType, setIssueType] = useState('Pothole')
  const [severity, setSeverity] = useState('medium')
  const [description, setDescription] = useState('')
  const [latitude, setLatitude] = useState(defaultLatitude)
  const [longitude, setLongitude] = useState(defaultLongitude)
  const [locationLabel, setLocationLabel] = useState('')
  const [city, setCity] = useState('')
  const [stateName, setStateName] = useState('')
  const [roadId, setRoadId] = useState<string | undefined>()
  const [roadName, setRoadName] = useState<string | undefined>()
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [draftSavedMessage, setDraftSavedMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [routingResult, setRoutingResult] = useState<ComplaintRoutingResult | null>(null)
  const [storeHydrated, setStoreHydrated] = useState(() => useComplaintStore.persist.hasHydrated())

  const draftRestoredRef = useRef(false)

  useEffect(() => {
    if (useComplaintStore.persist.hasHydrated()) {
      setStoreHydrated(true)
      return
    }

    return useComplaintStore.persist.onFinishHydration(() => {
      setStoreHydrated(true)
    })
  }, [])

  useEffect(() => {
    if (!storeHydrated) return

    const prefill = isComplaintFormPrefill(location.state?.prefill)
      ? location.state.prefill
      : null

    if (prefill) {
      setLatitude(String(prefill.lat))
      setLongitude(String(prefill.lng))
      setLocationLabel(prefill.locationLabel ?? prefill.title ?? prefill.roadName ?? '')
      setCity(prefill.city ?? '')
      setStateName(prefill.state ?? '')
      setRoadId(prefill.roadId)
      setRoadName(prefill.roadName)
      const normalizedIssue = normalizeIssueTypeForForm(prefill.issueType)
      if (normalizedIssue) setIssueType(normalizedIssue)
      draftRestoredRef.current = true
      return
    }

    if (draft && !draftRestoredRef.current) {
      applyDraftToForm(draft, {
        setRoadType,
        setIssueType,
        setSeverity,
        setDescription,
        setLatitude,
        setLongitude,
        setLocationLabel,
        setCity,
        setState: setStateName,
        setRoadId,
        setRoadName,
        setPhotoPreview,
      })
      draftRestoredRef.current = true
    }
  }, [draft, location.state, storeHydrated])

  useEffect(() => {
    if (!pickedLocation) return

    const place =
      pickedLocation.city && pickedLocation.state
        ? {
            city: pickedLocation.city,
            state: pickedLocation.state,
            label: pickedLocation.label ?? `${pickedLocation.city}, ${pickedLocation.state}`,
          }
        : inferPlaceFromCoordinates(pickedLocation.lat, pickedLocation.lng)

    const nextLatitude = String(pickedLocation.lat)
    const nextLongitude = String(pickedLocation.lng)
    const nextCity = place.city
    const nextState = place.state
    const nextLabel =
      pickedLocation.label ??
      place.label ??
      `Map location (${pickedLocation.lat.toFixed(4)}, ${pickedLocation.lng.toFixed(4)})`

    setLatitude(nextLatitude)
    setLongitude(nextLongitude)
    setCity(nextCity)
    setStateName(nextState)
    setLocationLabel(nextLabel)
    updateDraftLocation({
      latitude: nextLatitude,
      longitude: nextLongitude,
      locationLabel: nextLabel,
      city: nextCity,
      state: nextState,
    })
    clearPickedLocation()
  }, [pickedLocation, clearPickedLocation, updateDraftLocation])

  useEffect(() => {
    if (!routingResult || !successRef.current) return
    successRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [routingResult])

  const handleUseLocation = async () => {
    const result = await locate()
    if (result.position) {
      const place = inferPlaceFromCoordinates(result.position.lat, result.position.lng)
      setLatitude(String(result.position.lat))
      setLongitude(String(result.position.lng))
      setCity(place.city)
      setStateName(place.state)
      setLocationLabel(
        `Current location (${result.position.lat.toFixed(4)}, ${result.position.lng.toFixed(4)})`,
      )
    }
  }

  const syncFormToDraft = () => {
    saveDraftToStore({
      roadType,
      issueType,
      severity,
      description,
      latitude,
      longitude,
      locationLabel: locationLabel || undefined,
      city: city || undefined,
      state: stateName || undefined,
      roadId,
      roadName,
      photoDataUrl: photoPreview ?? undefined,
    })
    draftRestoredRef.current = true
  }

  const handlePickOnMap = () => {
    syncFormToDraft()
    requestComplaintLocationPick()
    navigate(routes.map)
  }

  const handleReportAnotherComplaint = () => {
    resetComplaintForm()
    setRoutingResult(null)
    setErrorMessage(null)
    setDraftSavedMessage(null)
    setRoadType('NH')
    setIssueType('Pothole')
    setSeverity('medium')
    setDescription('')
    setLatitude(defaultLatitude)
    setLongitude(defaultLongitude)
    setLocationLabel('')
    setCity('')
    setStateName('')
    setRoadId(undefined)
    setRoadName(undefined)
    setPhotoPreview(null)
    draftRestoredRef.current = false
  }

  const handleSaveDraft = () => {
    saveDraftToStore({
      roadType,
      issueType,
      severity,
      description,
      latitude,
      longitude,
      locationLabel: locationLabel || undefined,
      city: city || undefined,
      state: stateName || undefined,
      roadId,
      roadName,
      photoDataUrl: photoPreview ?? undefined,
    })
    draftRestoredRef.current = true
    setDraftSavedMessage('Draft saved. It will be restored when you return to this page.')
    window.setTimeout(() => setDraftSavedMessage(null), 4000)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)
    setRoutingResult(null)
    setDraftSavedMessage(null)

    const lat = Number.parseFloat(latitude)
    const lng = Number.parseFloat(longitude)

    if (!description.trim()) {
      setErrorMessage('Please enter a description for the complaint.')
      return
    }

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      setErrorMessage('Please provide valid latitude and longitude values.')
      return
    }

    setIsSubmitting(true)

    try {
      const result = await submitComplaint({
        roadType,
        issueType,
        severity,
        description: description.trim(),
        lat,
        lng,
        photoUrl: photoPreview ?? undefined,
      })

      addSubmittedComplaint(result, {
        roadId,
        roadName,
        locationLabel: locationLabel || roadName,
        city: city || undefined,
        state: stateName || undefined,
        photoDataUrl: photoPreview ?? undefined,
      })
      clearDraft()
      setRoutingResult(result)
    } catch {
      setErrorMessage('Unable to submit the complaint. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageContainer size="narrow" className="gap-6">
      <SectionHeader title={t('fileAComplaint')} description={t('complaintPageDesc')} />

      {errorMessage ? (
        <Alert variant="error" title="Submission failed">
          {errorMessage}
        </Alert>
      ) : null}

      {draftSavedMessage ? (
        <Alert variant="info" title="Draft saved">
          {draftSavedMessage}
        </Alert>
      ) : null}

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>{t('complaintDetails')}</CardTitle>
            <CardDescription>{t('complaintDetailsDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {locationLabel ? (
              <Alert variant="info" title="Location context">
                {locationLabel}
                {city || stateName ? ` • ${[city, stateName].filter(Boolean).join(', ')}` : ''}
                {roadName ? ` • ${roadName}` : ''}
              </Alert>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="complaint-road-type" required>
                Road Type
              </Label>
              <Select
                id="complaint-road-type"
                value={roadType}
                onChange={(event) => setRoadType(event.target.value as RoadType)}
                required
              >
                {ROAD_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="complaint-issue-type" required>
                {t('issueType')}
              </Label>
              <Select
                id="complaint-issue-type"
                value={issueType}
                onChange={(event) => setIssueType(event.target.value)}
                required
              >
                {COMPLAINT_ISSUE_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="complaint-severity" required>
                {t('severity')}
              </Label>
              <Select
                id="complaint-severity"
                value={severity}
                onChange={(event) => setSeverity(event.target.value)}
                required
              >
                {complaintSeverityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="complaint-description" required>
                {t('description')}
              </Label>
              <Textarea
                id="complaint-description"
                placeholder={t('descriptionPlaceholder')}
                rows={4}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
              />
            </div>

            <div className="space-y-3">
              <Label>Location</Label>
              <div className="flex flex-wrap gap-3">
                <Button type="button" variant="outline" onClick={() => void handleUseLocation()}>
                  Use current location
                </Button>
                <Button type="button" variant="outline" onClick={handlePickOnMap}>
                  Pick on map
                </Button>
              </div>
              {position ? (
                <p className="text-xs text-[var(--rw-text-tertiary)]">
                  Last known: {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
                  {geoStatus === 'denied' ? ' (permission denied)' : ''}
                </p>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="complaint-city">City</Label>
                <Input
                  id="complaint-city"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  placeholder="Chennai"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="complaint-state">State</Label>
                <Input
                  id="complaint-state"
                  value={stateName}
                  onChange={(event) => setStateName(event.target.value)}
                  placeholder="Tamil Nadu"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="complaint-latitude">{t('latitude')}</Label>
                <Input
                  id="complaint-latitude"
                  type="text"
                  inputMode="decimal"
                  placeholder="12.9716"
                  value={latitude}
                  onChange={(event) => setLatitude(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="complaint-longitude">{t('longitude')}</Label>
                <Input
                  id="complaint-longitude"
                  type="text"
                  inputMode="decimal"
                  placeholder="80.2421"
                  value={longitude}
                  onChange={(event) => setLongitude(event.target.value)}
                />
              </div>
            </div>

            <ComplaintPhotoField
              label={t('photo')}
              previewUrl={photoPreview}
              onChange={(preview) => setPhotoPreview(preview)}
            />
          </CardContent>
          <CardFooter className="flex flex-wrap gap-3">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting…' : t('submitComplaint')}
            </Button>
            <Button type="button" variant="outline" disabled={isSubmitting} onClick={handleSaveDraft}>
              {t('saveDraft')}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <div ref={trackSectionRef}>
        <TrackComplaintSection />
      </div>

      {routingResult ? (
        <>
          <ComplaintSubmissionSuccess
            ref={successRef}
            complaintId={routingResult.complaintId}
            status={routingResult.status}
            roadType={routingResult.roadType}
            assignedAuthority={routingResult.assignedAuthority}
            assignedDepartment={routingResult.assignedDepartment}
          />
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                trackSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
            >
              Track Complaint
            </Button>
            <Button type="button" variant="outline" onClick={handleReportAnotherComplaint}>
              Report Another Complaint
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate(routes.home)}>
              Back To Home
            </Button>
          </div>
        </>
      ) : null}
    </PageContainer>
  )
}
