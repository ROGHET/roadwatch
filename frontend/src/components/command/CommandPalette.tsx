import { Search } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { appCommands, type AppCommand } from '../../lib/appCommands'
import { rankByFuzzyQuery } from '../../lib/fuzzyMatch'
import { useThemeStore } from '../../providers/ThemeProvider'
import { useSettingsStore } from '../../stores/settingsStore'

export type CommandPaletteProps = {
  open: boolean
  onClose: () => void
  onOpenSettings?: () => void
}

function getSearchText(command: AppCommand) {
  return `${command.label} ${command.keywords} ${command.group}`
}

export function CommandPalette({ open, onClose, onOpenSettings }: CommandPaletteProps) {
  const navigate = useNavigate()
  const setTheme = useThemeStore((state) => state.setTheme)
  const setLanguage = useSettingsStore((state) => state.setLanguage)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)

  const results = useMemo(
    () => rankByFuzzyQuery(appCommands, query, getSearchText),
    [query],
  )

  const runCommand = useCallback(
    (command: AppCommand) => {
      onClose()
      setQuery('')
      setActiveIndex(0)

      if (command.action === 'open-settings' || command.action === 'open-accessibility') {
        onOpenSettings?.()
        if (command.action === 'open-accessibility') {
          navigate('/settings')
        }
        return
      }

      if (command.action === 'set-theme-dark') {
        setTheme('dark')
        return
      }

      if (command.action === 'set-theme-light') {
        setTheme('light')
        return
      }

      if (command.action === 'set-language-en') {
        setLanguage('en')
        return
      }

      if (command.action === 'set-language-hi') {
        setLanguage('hi')
        return
      }

      if (command.href) {
        navigate(command.href)
      }
    },
    [navigate, onClose, onOpenSettings, setLanguage, setTheme],
  )

  useEffect(() => {
    if (!open) return
    setQuery('')
    setActiveIndex(0)
    const timer = window.setTimeout(() => inputRef.current?.focus(), 0)
    return () => window.clearTimeout(timer)
  }, [open])

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setActiveIndex((index) => (results.length ? (index + 1) % results.length : 0))
        return
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setActiveIndex((index) =>
          results.length ? (index - 1 + results.length) % results.length : 0,
        )
        return
      }

      if (event.key === 'Enter' && results[activeIndex]) {
        event.preventDefault()
        runCommand(results[activeIndex])
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [activeIndex, onClose, open, results, runCommand])

  useEffect(() => {
    if (!open || !listRef.current) return
    const active = listRef.current.querySelector('[data-active="true"]')
    active?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[600] flex items-start justify-center px-4 pt-[12vh]">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close command palette"
        onClick={onClose}
      />
      <div
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl rw-glass-panel rw-glass-edge shadow-[var(--st-shadow-glass)]"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        <div className="flex items-center gap-3 border-b border-[var(--st-outline-white)] px-4 py-3">
          <Search className="size-5 shrink-0 text-[var(--st-primary)]" aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search commands…"
            className="min-w-0 flex-1 bg-transparent text-sm text-[var(--st-on-surface)] placeholder:text-[var(--st-on-surface-variant)] focus:outline-none"
            aria-controls="command-palette-list"
            aria-activedescendant={
              results[activeIndex] ? `command-option-${results[activeIndex].id}` : undefined
            }
            autoComplete="off"
          />
          <kbd className="hidden rounded-md border border-[var(--st-outline-white)] px-1.5 py-0.5 text-[10px] text-[var(--st-on-surface-variant)] sm:inline">
            Esc
          </kbd>
        </div>

        <div
          id="command-palette-list"
          ref={listRef}
          className="max-h-80 overflow-y-auto p-2"
          role="listbox"
        >
          {results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-[var(--st-on-surface-variant)]">
              No matching commands
            </p>
          ) : (
            results.map((command, index) => {
              const Icon = command.icon
              const isActive = index === activeIndex

              return (
                <button
                  key={command.id}
                  id={`command-option-${command.id}`}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  data-active={isActive ? 'true' : 'false'}
                  className={[
                    'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
                    isActive
                      ? 'bg-[var(--st-primary-container)]/25 text-[var(--st-on-surface)]'
                      : 'text-[var(--st-on-surface-variant)] hover:bg-white/5',
                  ].join(' ')}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => runCommand(command)}
                >
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-[var(--st-on-surface)]">
                      {command.label}
                    </span>
                    <span className="rw-type-metadata mt-0.5 block opacity-70">{command.group}</span>
                  </span>
                </button>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
