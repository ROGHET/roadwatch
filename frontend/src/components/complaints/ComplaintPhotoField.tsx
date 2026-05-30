import { Camera, ImagePlus, X } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import { Button } from '../common/Button'
import { Label } from '../common/Label'

export type ComplaintPhotoFieldProps = {
  label: string
  previewUrl: string | null
  onChange: (previewUrl: string | null, file: File | null) => void
}

const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const SUPPORTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

export function ComplaintPhotoField({ label, previewUrl, onChange }: ComplaintPhotoFieldProps) {
  const galleryInputId = useId()
  const cameraInputId = useId()
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFile = (fileList: FileList | null) => {
    const file = fileList?.[0]
    if (!file) return

    if (!SUPPORTED_IMAGE_TYPES.has(file.type)) {
      setError('Use a JPEG, PNG, WebP, or GIF image.')
      return
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setError('Image must be 10 MB or smaller.')
      return
    }

    setError(null)
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : null
      onChange(result, file)
    }
    reader.readAsDataURL(file)
  }

  const clearPhoto = () => {
    setError(null)
    onChange(null, null)
    if (galleryInputRef.current) galleryInputRef.current.value = ''
    if (cameraInputRef.current) cameraInputRef.current.value = ''
  }

  return (
    <div className="space-y-3">
      <Label>{label}</Label>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={() => galleryInputRef.current?.click()}>
          <ImagePlus className="mr-2 size-4" aria-hidden="true" />
          Choose from gallery
        </Button>
        <Button type="button" variant="outline" onClick={() => cameraInputRef.current?.click()}>
          <Camera className="mr-2 size-4" aria-hidden="true" />
          Take photo
        </Button>
        {previewUrl ? (
          <Button type="button" variant="ghost" onClick={clearPhoto}>
            <X className="mr-2 size-4" aria-hidden="true" />
            Remove
          </Button>
        ) : null}
      </div>

      <input
        ref={galleryInputRef}
        id={galleryInputId}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => handleFile(event.target.files)}
      />
      <input
        ref={cameraInputRef}
        id={cameraInputId}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(event) => handleFile(event.target.files)}
      />

      {previewUrl ? (
        <div className="overflow-hidden rounded-xl border border-[var(--rw-border)] bg-[var(--rw-surface-muted)] p-2">
          <img
            src={previewUrl}
            alt="Selected complaint photo preview"
            className="max-h-56 w-full rounded-lg object-cover"
          />
        </div>
      ) : (
        <p className="text-xs text-[var(--rw-text-tertiary)]">
          Attach a photo from your gallery or capture one with your camera.
        </p>
      )}

      {error ? <p className="text-xs text-[var(--rw-danger)]">{error}</p> : null}
    </div>
  )
}
