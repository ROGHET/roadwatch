import { NavLink, Outlet } from 'react-router-dom'

const navLinks: { to: string; label: string; end?: boolean }[] = [
  { to: '/', label: 'Home', end: true },
  { to: '/complaint', label: 'Complaint' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/assistant', label: 'Assistant' },
]

function navLinkClassName({ isActive }: { isActive: boolean }) {
  return [
    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50',
  ].join(' ')
}

export default function MainLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <nav
          className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
          aria-label="Main navigation"
        >
          <NavLink
            to="/"
            className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50"
          >
            RoadWatch
          </NavLink>

          <ul className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-1">
            {navLinks.map(({ to, label, end }) => (
              <li key={to}>
                <NavLink to={to} end={end} className={navLinkClassName}>
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-4 text-center text-sm text-slate-500 sm:px-6 dark:text-slate-400">
          RoadWatch — Road Safety Transparency Platform
        </div>
      </footer>
    </div>
  )
}
