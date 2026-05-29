import { motion, useReducedMotion } from 'framer-motion'
import { NavLink } from 'react-router-dom'
import { AnimatedOutlet } from '../components/common/AnimatedOutlet'
import { fadeInDown, springSnappy, transitions } from '../lib/motion'

const navLinks: { to: string; label: string; end?: boolean }[] = [
  { to: '/', label: 'Home', end: true },
  { to: '/complaint', label: 'Complaint' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/assistant', label: 'Assistant' },
]

function LayoutNavLink({
  to,
  label,
  end,
}: {
  to: string
  label: string
  end?: boolean
}) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <NavLink to={to} end={end} className="relative block rounded-lg px-3 py-2 text-sm font-medium outline-none">
      {({ isActive }) => (
        <>
          {isActive ? (
            <motion.span
              layoutId={prefersReducedMotion ? undefined : 'layout-nav-active'}
              className="absolute inset-0 rounded-lg bg-[var(--rw-primary)]"
              transition={prefersReducedMotion ? undefined : springSnappy}
              aria-hidden="true"
            />
          ) : null}
          <span
            className={[
              'relative z-10 transition-colors duration-200',
              isActive
                ? 'text-[var(--rw-primary-foreground)]'
                : 'text-[var(--rw-text-secondary)] hover:text-[var(--rw-text-primary)]',
            ].join(' ')}
          >
            {label}
          </span>
        </>
      )}
    </NavLink>
  )
}

export default function MainLayout() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--rw-background)]">
      <motion.header
        className="sticky top-0 z-[300] border-b border-[var(--rw-border)] bg-[var(--rw-background)]/80 backdrop-blur-md backdrop-saturate-150"
        variants={prefersReducedMotion ? undefined : fadeInDown}
        initial={prefersReducedMotion ? false : 'hidden'}
        animate={prefersReducedMotion ? undefined : 'visible'}
        transition={transitions.normal}
      >
        <nav
          className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4"
          aria-label="Main navigation"
        >
          <NavLink
            to="/"
            className="group inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-[var(--rw-text-primary)] outline-none transition-opacity duration-200 hover:opacity-90"
          >
            <span
              className="size-2 rounded-full bg-[var(--rw-primary)] transition-transform duration-200 group-hover:scale-110"
              aria-hidden="true"
            />
            RoadWatch
          </NavLink>

          <ul className="grid grid-cols-2 gap-1.5 sm:flex sm:items-center sm:gap-1">
            {navLinks.map(({ to, label, end }) => (
              <li key={to}>
                <LayoutNavLink to={to} label={label} end={end} />
              </li>
            ))}
          </ul>
        </nav>
      </motion.header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <AnimatedOutlet />
      </main>

      <footer className="border-t border-[var(--rw-border)] bg-[var(--rw-surface-muted)]">
        <div className="mx-auto max-w-6xl px-4 py-4 text-center text-sm text-[var(--rw-text-tertiary)] sm:px-6">
          RoadWatch | Road Safety Transparency Platform
        </div>
      </footer>
    </div>
  )
}
