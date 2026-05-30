import {
  BarChart3,
  Bot,
  FileText,
  FileWarning,
  Globe,
  Home,
  Info,
  LayoutDashboard,
  Map,
  Moon,
  Settings,
  Shield,
  Sun,
  Type,
  Users,
  Wallet,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { routes } from './routes'

export type AppCommandAction =
  | 'open-settings'
  | 'set-theme-dark'
  | 'set-theme-light'
  | 'set-language-en'
  | 'set-language-hi'
  | 'open-accessibility'
  | 'open-rti'

export type AppCommandGroup =
  | 'Navigation'
  | 'Complaints'
  | 'Map'
  | 'Assistant'
  | 'RTI'
  | 'Analytics'
  | 'Settings'

export type AppCommand = {
  id: string
  label: string
  description?: string
  keywords: string
  icon: LucideIcon
  group: AppCommandGroup
  href?: string
  action?: AppCommandAction
}

export const commandGroupStyles: Record<
  AppCommandGroup,
  { badge: string; iconWrap: string }
> = {
  Navigation: {
    badge: 'bg-[var(--st-primary)]/15 text-[var(--st-primary)]',
    iconWrap: 'bg-[var(--st-primary)]/10 text-[var(--st-primary)]',
  },
  Complaints: {
    badge: 'bg-[var(--st-error)]/15 text-[var(--st-error)]',
    iconWrap: 'bg-[var(--st-error)]/10 text-[var(--st-error)]',
  },
  Map: {
    badge: 'bg-[var(--st-secondary)]/15 text-[var(--st-secondary)]',
    iconWrap: 'bg-[var(--st-secondary)]/10 text-[var(--st-secondary)]',
  },
  Assistant: {
    badge: 'bg-[var(--st-tertiary)]/15 text-[var(--st-tertiary)]',
    iconWrap: 'bg-[var(--st-tertiary)]/10 text-[var(--st-tertiary)]',
  },
  RTI: {
    badge: 'bg-amber-500/15 text-amber-400',
    iconWrap: 'bg-amber-500/10 text-amber-400',
  },
  Analytics: {
    badge: 'bg-violet-500/15 text-violet-300',
    iconWrap: 'bg-violet-500/10 text-violet-300',
  },
  Settings: {
    badge: 'bg-slate-500/15 text-slate-300',
    iconWrap: 'bg-slate-500/10 text-slate-300',
  },
}

export const appCommands: AppCommand[] = [
  {
    id: 'home',
    label: 'Home',
    description: 'Back to dashboard overview',
    keywords: 'home dashboard overview landing',
    icon: Home,
    group: 'Navigation',
    href: routes.home,
  },
  {
    id: 'open-map',
    label: 'Open Map',
    description: 'Explore roads and complaints on the map',
    keywords: 'map roads explore clustering route preview filters search',
    icon: Map,
    group: 'Map',
    href: routes.map,
  },
  {
    id: 'open-dashboard',
    label: 'Open Dashboard',
    description: 'View authority metrics and analytics',
    keywords: 'dashboard analytics metrics overview',
    icon: LayoutDashboard,
    group: 'Analytics',
    href: routes.dashboard,
  },
  {
    id: 'open-complaint',
    label: 'File Complaint',
    description: 'Submit a new road safety complaint',
    keywords: 'complaint file report issue submit',
    icon: FileWarning,
    group: 'Complaints',
    href: routes.complaint,
  },
  {
    id: 'my-complaints',
    label: 'Track Complaints',
    description: 'Look up complaint status by ID',
    keywords: 'complaints tracking status my issues track',
    icon: FileWarning,
    group: 'Complaints',
    href: routes.complaint,
  },
  {
    id: 'report-issue',
    label: 'Report Issue',
    description: 'Quick route to complaint filing',
    keywords: 'report complaint issue file',
    icon: FileWarning,
    group: 'Complaints',
    href: routes.complaint,
  },
  {
    id: 'open-assistant',
    label: 'Open AI Assistant',
    description: 'Ask CrashZero AI for help',
    keywords: 'ai assistant chat help roadwatch gemini',
    icon: Bot,
    group: 'Assistant',
    href: routes.assistant,
  },
  {
    id: 'generate-rti',
    label: 'Generate RTI Request',
    description: 'Draft a Right to Information application',
    keywords: 'rti right to information request draft generate',
    icon: FileText,
    group: 'RTI',
    action: 'open-rti',
  },
  {
    id: 'open-analytics',
    label: 'Open Analytics',
    description: 'Charts for categories, trends, and budget',
    keywords: 'analytics charts statistics trends road quality budget',
    icon: BarChart3,
    group: 'Analytics',
    href: routes.dashboard,
  },
  {
    id: 'budget-transparency',
    label: 'Budget Transparency',
    description: 'Review sanctioned and spent budgets',
    keywords: 'budget spending transparency utilization',
    icon: Wallet,
    group: 'Analytics',
    href: routes.dashboard,
  },
  {
    id: 'road-intelligence',
    label: 'Road Intelligence',
    description: 'Quality, repair trends, and corridor data',
    keywords: 'road intelligence quality repair trends corridors',
    icon: Shield,
    group: 'Analytics',
    href: routes.dashboard,
  },
  {
    id: 'contractor-information',
    label: 'Contractor Information',
    description: 'Vendor and maintenance contractor records',
    keywords: 'contractor performance vendors maintenance',
    icon: Users,
    group: 'Analytics',
    href: routes.dashboard,
  },
  {
    id: 'settings',
    label: 'Settings',
    description: 'Theme, language, and accessibility',
    keywords: 'settings preferences configuration theme language accessibility',
    icon: Settings,
    group: 'Settings',
    action: 'open-settings',
  },
  {
    id: 'theme-dark',
    label: 'Dark Mode',
    description: 'Switch to dark appearance',
    keywords: 'theme dark mode appearance night',
    icon: Moon,
    group: 'Settings',
    action: 'set-theme-dark',
  },
  {
    id: 'theme-light',
    label: 'Light Mode',
    description: 'Switch to light appearance',
    keywords: 'theme light mode appearance day',
    icon: Sun,
    group: 'Settings',
    action: 'set-theme-light',
  },
  {
    id: 'language',
    label: 'Language',
    description: 'Open language preferences',
    keywords: 'language hindi english locale translate',
    icon: Globe,
    group: 'Settings',
    href: '/language',
  },
  {
    id: 'language-english',
    label: 'Switch to English',
    description: 'Set interface language to English',
    keywords: 'language english en locale',
    icon: Globe,
    group: 'Settings',
    action: 'set-language-en',
  },
  {
    id: 'language-hindi',
    label: 'Switch to Hindi',
    description: 'Set interface language to Hindi',
    keywords: 'language hindi hi locale',
    icon: Globe,
    group: 'Settings',
    action: 'set-language-hi',
  },
  {
    id: 'accessibility',
    label: 'Accessibility',
    description: 'Font size and readability options',
    keywords: 'accessibility font size text settings',
    icon: Type,
    group: 'Settings',
    action: 'open-accessibility',
  },
  {
    id: 'about',
    label: 'About',
    description: 'Learn about the RoadWatch platform',
    keywords: 'about roadwatch platform version',
    icon: Info,
    group: 'Navigation',
    href: '/about',
  },
]
