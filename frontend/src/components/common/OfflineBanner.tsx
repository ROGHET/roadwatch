import { useEffect, useState } from 'react'
import { Button } from './Button'
import { useI18n } from '../../lib/i18n'

export function OfflineBanner() {
  const { t } = useI18n()
  const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)
  const [showBackOnline, setShowBackOnline] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true)
      setShowBackOnline(true)
    }
    const handleOffline = () => {
      setOnline(false)
      setShowBackOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (online && showBackOnline) {
    return (
      <div className="pointer-events-none fixed inset-x-0 top-[calc(var(--st-floating-offset)+0.5rem)] z-[700] flex justify-center px-4">
        <div className="pointer-events-auto rw-map-glass rounded-full px-4 py-2 text-xs font-medium text-[var(--st-tertiary)] shadow-lg">
          {t('backOnline')}
          <button type="button" className="ml-2 underline" onClick={() => setShowBackOnline(false)}>
            {t('closeDetails')}
          </button>
        </div>
      </div>
    )
  }

  if (online) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[calc(var(--st-floating-offset)+0.5rem)] z-[700] flex justify-center px-4">
      <div className="pointer-events-auto rw-map-glass flex max-w-lg items-center gap-3 rounded-2xl px-4 py-3 text-sm shadow-lg">
        <span className="text-[var(--rw-text-primary)]">{t('offlineBanner')}</span>
        <Button type="button" className="shrink-0 rounded-full px-3 py-1 text-xs" onClick={() => window.location.reload()}>
          {t('offlineRetry')}
        </Button>
      </div>
    </div>
  )
}
