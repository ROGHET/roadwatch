import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { MapFullScreenExperience } from '../../components/map/MapFullScreenExperience'
import { useComplaintStore } from '../../stores/complaintStore'

export default function MapPage() {
  const location = useLocation()
  const complaintPickMode = useComplaintStore((state) => state.complaintPickMode)
  const cancelLocationPick = useComplaintStore((state) => state.cancelLocationPick)
  const openedForComplaintPick =
    (location.state as { complaintPickMode?: boolean } | null)?.complaintPickMode === true

  useEffect(() => {
    if (!openedForComplaintPick && complaintPickMode) {
      cancelLocationPick()
    }
  }, [cancelLocationPick, complaintPickMode, openedForComplaintPick])

  return <MapFullScreenExperience />
}
