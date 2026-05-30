import { Search } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  appCommands,
  commandGroupStyles,
  type AppCommand,
  type AppCommandGroup,
} from '../../lib/appCommands'
import { rankByFuzzyQuery } from '../../lib/fuzzyMatch'
import { useThemeStore } from '../../providers/ThemeProvider'
import { useSettingsStore } from '../../stores/settingsStore'

export type CommandPaletteProps = {
  open: boolean
  onClose: () => void
  onOpenSettings?: () => void
  onOpenRti?: () => void
}

const groupOrder: AppCommandGroup[] = [
  'Navigation',
  'Complaints',
  'Map',
  'Assistant',
  'RTI',
  'Analytics',
  'Settings',
]

function getSearchText(command: AppCommand) {
  return `${command.label} ${command.description ?? ''} ${command.keywords} ${command.group}`
}

export function CommandPalette({ open, onClose, onOpenSettings, onOpenRti }: CommandPaletteProps) {
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

  const groupedResults = useMemo(() => {
    return groupOrder
      .map((group) => ({
        group,
        commands: results.filter((command) => command.group === group),
      }))
      .filter((entry) => entry.commands.length > 0)
  }, [results])

  const flatResults = useMemo(
    () => groupedResults.flatMap((entry) => entry.commands),
    [groupedResults],
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

      if (command.action === 'open-rti') {
        onOpenRti?.()
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
    [navigate, onClose, onOpenRti, onOpenSettings, setLanguage, setTheme],
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
        setActiveIndex((index) => (flatResults.length ? (index + 1) % flatResults.length : 0))
        return
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setActiveIndex((index) =>
          flatResults.length ? (index - 1 + flatResults.length) % flatResults.length : 0,
        )
        return
      }

      if (event.key === 'Enter' && flatResults[activeIndex]) {
        event.preventDefault()
        runCommand(flatResults[activeIndex])
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [activeIndex, flatResults, onClose, open, runCommand])

  useEffect(() => {
    if (!open || !listRef.current) return
    const active = listRef.current.querySelector('[data-active="true"]')
    active?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, open])

  if (!open) return null

  let runningIndex = -1

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
              flatResults[activeIndex] ? `command-option-${flatResults[activeIndex].id}` : undefined
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
          {flatResults.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-[var(--st-on-surface-variant)]">
              No matching commands
            </p>
          ) : (
            groupedResults.map(({ group, commands }) => (
              <div key={group} className="mb-2">
                <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--st-on-surface-variant)]">
                  {group}
                </p>
                {commands.map((command) => {
                  runningIndex += 1
                  const index = runningIndex
                  const Icon = command.icon
                  const isActive = index === activeIndex
                  const styles = commandGroupStyles[group]

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
                      <span
                        className={`inline-flex size-8 shrink-0 items-center justify-center rounded-lg ${styles.iconWrap}`}
                      >
                        <Icon className="size-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="block font-medium text-[var(--st-on-surface)]">
                            {command.label}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${styles.badge}`}
                          >
                            {group}
                          </span>
                        </span>
                        {command.description ? (
                          <span className="rw-type-metadata mt-0.5 block opacity-70">
                            {command.description}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-[var(--st-outline-white)] px-4 py-2 text-[10px] text-[var(--st-on-surface-variant)]">
          <span>
            <kbd className="rounded border border-[var(--st-outline-white)] px-1">↑↓</kbd> navigate
          </span>
          <span>
            <kbd className="rounded border border-[var(--st-outline-white)] px-1">Enter</kbd> select
          </span>
          <span>
            <kbd className="rounded border border-[var(--st-outline-white)] px-1">Esc</kbd> close
          </span>
        </div>
      </div>
    </div>
  )
}
