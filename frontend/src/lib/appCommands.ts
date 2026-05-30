import {
  BarChart3,
  Bot,
  FileWarning,
  Globe,
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

export type AppCommand = {
  id: string
  label: string
  keywords: string
  icon: LucideIcon
  group: 'Navigation' | 'Actions' | 'Information'
  href?: string
  action?: AppCommandAction
}

export const appCommands: AppCommand[] = [
  {
    id: 'open-map',
    label: 'Open Map',
    keywords: 'map roads explore clustering route preview filters search',
    icon: Map,
    group: 'Navigation',
    href: routes.map,
  },
  {
    id: 'open-dashboard',
    label: 'Open Dashboard',
    keywords: 'dashboard analytics metrics overview',
    icon: LayoutDashboard,
    group: 'Navigation',
    href: routes.dashboard,
  },
  {
    id: 'open-complaint',
    label: 'Open Complaint',
    keywords: 'complaint file report issue submit track',
    icon: FileWarning,
    group: 'Navigation',
    href: routes.complaint,
  },
  {
    id: 'theme-dark',
    label: 'Dark Mode',
    keywords: 'theme dark mode appearance night',
    icon: Moon,
    group: 'Actions',
    action: 'set-theme-dark',
  },
  {
    id: 'theme-light',
    label: 'Light Mode',
    keywords: 'theme light mode appearance day',
    icon: Sun,
    group: 'Actions',
    action: 'set-theme-light',
  },
  {
    id: 'language',
    label: 'Language',
    keywords: 'language hindi english locale translate',
    icon: Globe,
    group: 'Actions',
    href: '/language',
  },
  {
    id: 'language-english',
    label: 'Switch to English',
    keywords: 'language english en locale',
    icon: Globe,
    group: 'Actions',
    action: 'set-language-en',
  },
  {
    id: 'language-hindi',
    label: 'Switch to Hindi',
    keywords: 'language hindi hi locale',
    icon: Globe,
    group: 'Actions',
    action: 'set-language-hi',
  },
  {
    id: 'settings',
    label: 'Settings',
    keywords: 'settings preferences configuration theme language accessibility',
    icon: Settings,
    group: 'Actions',
    action: 'open-settings',
  },
  {
    id: 'accessibility',
    label: 'Accessibility',
    keywords: 'accessibility font size text settings',
    icon: Type,
    group: 'Actions',
    action: 'open-accessibility',
  },
  {
    id: 'open-analytics',
    label: 'Open Analytics',
    keywords: 'analytics charts statistics trends road quality budget',
    icon: BarChart3,
    group: 'Navigation',
    href: routes.dashboard,
  },
  {
    id: 'open-assistant',
    label: 'Open AI Assistant',
    keywords: 'ai assistant chat help roadwatch',
    icon: Bot,
    group: 'Navigation',
    href: routes.assistant,
  },
  {
    id: 'report-issue',
    label: 'Report Issue',
    keywords: 'report complaint issue file',
    icon: FileWarning,
    group: 'Actions',
    href: routes.complaint,
  },
  {
    id: 'my-complaints',
    label: 'My Complaints',
    keywords: 'complaints tracking status my issues',
    icon: FileWarning,
    group: 'Actions',
    href: routes.complaint,
  },
  {
    id: 'budget-transparency',
    label: 'Budget Transparency',
    keywords: 'budget spending transparency utilization',
    icon: Wallet,
    group: 'Information',
    href: routes.dashboard,
  },
  {
    id: 'contractor-information',
    label: 'Contractor Information',
    keywords: 'contractor performance vendors maintenance',
    icon: Users,
    group: 'Information',
    href: routes.dashboard,
  },
  {
    id: 'road-intelligence',
    label: 'Road Intelligence',
    keywords: 'road intelligence quality repair trends corridors',
    icon: Shield,
    group: 'Information',
    href: routes.dashboard,
  },
  {
    id: 'about',
    label: 'About',
    keywords: 'about roadwatch platform version',
    icon: Info,
    group: 'Information',
    href: '/about',
  },
]
