import { Copy, Download, FileText, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '../common/Button'
import { Input } from '../common/Input'
import { Label } from '../common/Label'
import { Select } from '../common/Select'
import { StateSelect } from '../common/StateSelect'
import { Textarea } from '../common/Textarea'
import {
  buildRtiDocument,
  createRtiPdfBlob,
  inferStatePwdAuthority,
  RTI_PUBLIC_AUTHORITIES,
  STATE_PWD_AUTHORITIES,
  type RtiDocument,
} from '../../lib/rti/rtiDocument'
import { useMapStore } from '../../stores/mapStore'

export type RtiGenerationModalProps = {
  open: boolean
  onClose: () => void
  defaultAuthority?: string
  defaultInformation?: string
}

export function RtiGenerationModal({
  open,
  onClose,
  defaultAuthority = 'NHAI',
  defaultInformation = '',
}: RtiGenerationModalProps) {
  const [informationSought, setInformationSought] = useState(defaultInformation)
  const [publicAuthority, setPublicAuthority] = useState(defaultAuthority)
  const [applicantName, setApplicantName] = useState('')
  const [applicantAddress, setApplicantAddress] = useState('')
  const [applicantState, setApplicantState] = useState('')
  const selection = useMapStore((state) => state.selection)
  const center = useMapStore((state) => state.center)
  const [generated, setGenerated] = useState<RtiDocument | null>(null)
  const [copyMessage, setCopyMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setInformationSought(defaultInformation)
    const inferredState =
      selection?.kind === 'location'
        ? selection.intelligence.state
        : selection?.kind === 'complaint'
          ? undefined
          : undefined
    const authority =
      defaultAuthority === 'State PWD'
        ? inferStatePwdAuthority(inferredState)
        : defaultAuthority
    setPublicAuthority(authority)
    setApplicantState(inferredState ?? '')
    setGenerated(null)
    setCopyMessage(null)
  }, [center.lat, center.lng, defaultAuthority, defaultInformation, open, selection])

  if (!open) return null

  const handleGenerate = () => {
    setGenerated(
      buildRtiDocument({
        informationSought,
        publicAuthority:
          publicAuthority === 'State PWD'
            ? inferStatePwdAuthority(applicantState.trim() || undefined)
            : publicAuthority,
        applicantName: applicantName.trim() || undefined,
        applicantAddress: applicantAddress.trim() || undefined,
        state: applicantState.trim() || undefined,
      }),
    )
    setCopyMessage(null)
  }

  const handleCopy = async () => {
    if (!generated) return
    await navigator.clipboard.writeText(generated.plainText)
    setCopyMessage('Copied to clipboard')
  }

  const handleDownload = () => {
    if (!generated) return
    const blob = createRtiPdfBlob(generated)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'RoadWatch-RTI-Application.pdf'
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 z-[650] flex items-center justify-center px-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/55"
        aria-label="Close RTI modal"
        onClick={onClose}
      />
      <div
        className="relative z-10 flex max-h-[min(92dvh,820px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[var(--rw-border)] bg-[var(--rw-surface)] shadow-[var(--st-shadow-glass)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rti-modal-title"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[var(--rw-border)] px-5 py-4">
          <div>
            <h2 id="rti-modal-title" className="font-serif text-xl text-[var(--rw-text-primary)]">
              Generate RTI Request
            </h2>
            <p className="mt-1 text-sm text-[var(--rw-text-secondary)]">
              Draft a formal application under the RTI Act, 2005.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-9 items-center justify-center rounded-full text-[var(--rw-text-secondary)] hover:bg-[var(--rw-surface-muted)]"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {!generated ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rti-information" required>
                  Information Sought
                </Label>
                <Textarea
                  id="rti-information"
                  rows={6}
                  value={informationSought}
                  onChange={(event) => setInformationSought(event.target.value)}
                  placeholder="e.g. Details of budget allocated for road repairs on NH-48 in FY 2025-26, including contractor details and completion status..."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="rti-authority" required>
                    Public Authority
                  </Label>
                  <Select
                    id="rti-authority"
                    value={publicAuthority}
                    onChange={(event) => setPublicAuthority(event.target.value)}
                  >
                    {[...new Set([...RTI_PUBLIC_AUTHORITIES, ...STATE_PWD_AUTHORITIES])].map((authority) => (
                      <option key={authority} value={authority}>
                        {authority}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rti-applicant">Applicant Name (optional)</Label>
                  <Input
                    id="rti-applicant"
                    value={applicantName}
                    onChange={(event) => setApplicantName(event.target.value)}
                    placeholder="Full name"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="rti-address">Applicant Address (optional)</Label>
                  <Input
                    id="rti-address"
                    value={applicantAddress}
                    onChange={(event) => setApplicantAddress(event.target.value)}
                    placeholder="House no., street, city, PIN"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rti-state">State (for State PWD routing)</Label>
                  <StateSelect
                    id="rti-state"
                    value={applicantState}
                    onChange={setApplicantState}
                    placeholder="Select state"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-[var(--rw-text-primary)]">
                <FileText className="size-4" aria-hidden="true" />
                Preview
              </div>
              <pre className="whitespace-pre-wrap rounded-xl border border-[var(--rw-border)] bg-[var(--rw-surface-muted)] p-4 text-sm leading-6 text-[var(--rw-text-primary)]">
                {generated.plainText}
              </pre>
              {copyMessage ? (
                <p className="text-xs text-[var(--st-tertiary)]">{copyMessage}</p>
              ) : null}
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-[var(--rw-border)] px-5 py-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {!generated ? (
            <Button type="button" onClick={handleGenerate} disabled={!informationSought.trim()}>
              Generate RTI
            </Button>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={() => setGenerated(null)}>
                Edit
              </Button>
              <Button type="button" variant="outline" onClick={() => void handleCopy()}>
                <Copy className="mr-2 size-4" />
                Copy Text
              </Button>
              <Button type="button" onClick={handleDownload}>
                <Download className="mr-2 size-4" />
                Download PDF
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
