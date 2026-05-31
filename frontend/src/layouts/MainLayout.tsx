import { Bot, FileWarning, Home, LayoutDashboard, Map, Search } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { AnimatedOutlet } from '../components/common/AnimatedOutlet'
import { useHydrateComplaints } from '../hooks/useHydrateComplaints'
import { OfflineBanner } from '../components/common/OfflineBanner'
import { CommandPalette } from '../components/command/CommandPalette'
import { RtiGenerationModal } from '../components/rti/RtiGenerationModal'
import { ProfileMenu } from '../components/navigation/ProfileMenu'
import { fadeInDown, transitions } from '../lib/motion'
import { routes } from '../lib/routes'
import { useI18n, type TranslationKey } from '../lib/i18n'

const navLinks = [
  { to: routes.home, labelKey: 'navHome', icon: Home, end: true },
  { to: routes.map, labelKey: 'navMap', icon: Map },
  { to: routes.dashboard, labelKey: 'navDashboard', icon: LayoutDashboard },
  { to: routes.complaint, labelKey: 'navComplaint', icon: FileWarning },
  { to: routes.assistant, labelKey: 'navAI', icon: Bot },
] as const

function FloatingNavLink({
  to,
  label,
  icon: Icon,
  end,
}: {
  to: string
  label: string
  icon: typeof Home
  end?: boolean
}) {
  return (
    <NavLink to={to} end={end} className="relative outline-none" aria-label={label}>
      {({ isActive }) => (
        <span
          className={[
            'inline-flex items-center justify-center rounded-full p-3 transition-all duration-200',
            isActive
                ? 'bg-[var(--st-primary-container)] text-[var(--st-on-primary-container)] shadow-[var(--st-shadow-fab)] -translate-y-0.5'
                : 'text-[var(--st-on-surface-variant)] hover:text-[var(--st-primary)]',
          ].join(' ')}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
      )}
    </NavLink>
  )
}

export default function MainLayout() {
  useHydrateComplaints()
  const prefersReducedMotion = useReducedMotion()
  const location = useLocation()
  const isMapRoute = location.pathname === routes.map
  const [commandOpen, setCommandOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [rtiModalOpen, setRtiModalOpen] = useState(false)
  const { t } = useI18n()

  const openCommandPalette = useCallback(() => setCommandOpen(true), [])
  const closeCommandPalette = useCallback(() => setCommandOpen(false), [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setCommandOpen((open) => !open)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleOpenSettings = () => {
    closeCommandPalette()
    setProfileMenuOpen(true)
  }

  return (
    <div
      className={[
        'flex min-h-dvh flex-col overflow-x-hidden bg-[var(--rw-background)]',
        isMapRoute ? 'h-dvh overflow-hidden' : '',
      ].join(' ')}
    >
      <motion.header
        className={[
          'pointer-events-none fixed inset-x-0 top-[var(--st-floating-offset)] z-[300] px-[var(--st-safe-margin)]',
        ].join(' ')}
        variants={prefersReducedMotion ? undefined : fadeInDown}
        initial={prefersReducedMotion ? false : 'hidden'}
        animate={prefersReducedMotion ? undefined : 'visible'}
        transition={transitions.normal}
      >
        <nav
          className="rw-glass-nav pointer-events-auto mx-auto flex h-14 w-full max-w-6xl min-w-0 items-center gap-2 rounded-full px-2 sm:gap-3 sm:px-4"
          aria-label="Main navigation"
        >
          <button
            type="button"
            onClick={openCommandPalette}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-[var(--st-primary)] transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rw-ring)]"
            aria-label="Open command palette"
          >
            <Search className="size-5" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={openCommandPalette}
            className="min-w-0 flex-1 truncate text-left font-serif text-base tracking-tight text-[var(--st-primary)] outline-none transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rw-ring)] sm:text-xl"
            aria-label="Open command palette"
          >
            {t('appName')}
          </button>

          <ul className="hidden items-center gap-1 lg:flex">
            {navLinks.map(({ to, labelKey, icon, ...rest }) => (
              <li key={to}>
                <FloatingNavLink to={to} label={t(labelKey as TranslationKey)} icon={icon} {...rest} />
              </li>
            ))}
          </ul>

          <ProfileMenu open={profileMenuOpen} onOpenChange={setProfileMenuOpen} />
        </nav>
      </motion.header>

      <main
        className={
          isMapRoute
            ? 'flex min-h-0 w-full max-w-none flex-1 flex-col p-0'
            : 'mx-auto flex w-full max-w-6xl flex-1 flex-col px-[var(--st-safe-margin)] pb-28 pt-24 sm:pt-28'
        }
      >
        <AnimatedOutlet />
      </main>

      <nav
        className="rw-glass-nav fixed bottom-[var(--st-floating-offset)] left-[var(--st-safe-margin)] right-[var(--st-safe-margin)] z-[300] flex h-16 items-center justify-around rounded-full lg:hidden"
        aria-label="Mobile navigation"
      >
        {navLinks.map(({ to, labelKey, icon, ...rest }) => (
          <FloatingNavLink key={to} to={to} label={t(labelKey as TranslationKey)} icon={icon} {...rest} />
        ))}
      </nav>

      <footer
        className={[
          'hidden border-t border-[var(--st-outline-white)] bg-[var(--st-surface-container-low)] md:block',
          isMapRoute ? 'md:hidden' : '',
        ].join(' ')}
      >
        <div className="mx-auto max-w-6xl px-[var(--st-safe-margin)] py-4 text-center text-sm text-[var(--st-on-surface-variant)]">
          {t('appName')} | Road Safety Transparency Platform
        </div>
      </footer>

      <OfflineBanner />
      <CommandPalette
        open={commandOpen}
        onClose={closeCommandPalette}
        onOpenSettings={handleOpenSettings}
        onOpenRti={() => {
          closeCommandPalette()
          setRtiModalOpen(true)
        }}
      />
      <RtiGenerationModal open={rtiModalOpen} onClose={() => setRtiModalOpen(false)} />
    </div>
  )
}
