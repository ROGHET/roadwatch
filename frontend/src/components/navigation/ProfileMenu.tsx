import { Globe, Info, Moon, Settings, User } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { twMerge } from 'tailwind-merge'
import { useThemeStore } from '../../providers/ThemeProvider'
import { useI18n, type TranslationKey } from '../../lib/i18n'

export type ProfileMenuProps = {
  className?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const menuItems = [
  { id: 'settings', labelKey: 'settings', icon: Settings, path: '/settings' },
  { id: 'language', labelKey: 'language', icon: Globe, path: '/language' },
  { id: 'theme', labelKey: 'theme', icon: Moon },
  { id: 'about', labelKey: 'about', icon: Info, path: '/about' },
] as const

export function ProfileMenu({ className, open: openProp, onOpenChange }: ProfileMenuProps) {
  const menuId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const [internalOpen, setInternalOpen] = useState(false)
  const open = openProp ?? internalOpen
  
  const theme = useThemeStore((state) => state.theme)
  const setTheme = useThemeStore((state) => state.setTheme)
  const { t } = useI18n()

  const setOpen = (value: boolean) => {
    if (onOpenChange) onOpenChange(value)
    else setInternalOpen(value)
  }

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
    setOpen(false)
  }

  return (
    <div ref={rootRef} className={twMerge('relative', className)}>
      <button
        type="button"
        className="inline-flex size-8 items-center justify-center overflow-hidden rounded-full border border-[var(--st-outline-white)] bg-[var(--st-surface-container-high)] text-[var(--st-on-surface-variant)] transition-colors hover:text-[var(--st-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rw-ring)]"
        aria-label="Profile and settings"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen(!open)}
      >
        <User className="size-4" aria-hidden="true" />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-[11rem] overflow-hidden rounded-2xl rw-glass-panel rw-glass-edge py-1 shadow-[var(--st-shadow-glass)]"
        >
          {menuItems.map((item) => {
            const { id, labelKey, icon: Icon } = item
            const path = 'path' in item ? item.path : undefined

            return (
            <button
              key={id}
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-[var(--st-on-surface)] transition-colors hover:bg-white/5"
              onClick={() => {
                if (id === 'theme') {
                  handleThemeToggle()
                  return
                }
                if (path) {
                  navigate(path)
                }
                setOpen(false)
              }}
            >
              <Icon className="size-4 text-[var(--st-on-surface-variant)]" aria-hidden="true" />
              {t(labelKey as TranslationKey)}
            </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
