import {
  BarChart3,
  Bot,
  FileWarning,
  Info,
  LayoutDashboard,
  Map,
  Settings,
  Shield,
  Users,
  Wallet,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { routes } from './routes'

export type AppCommand = {
  id: string
  label: string
  keywords: string
  icon: LucideIcon
  group: 'Navigation' | 'Actions' | 'Information'
  href?: string
  action?: 'open-settings'
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
    id: 'settings',
    label: 'Settings',
    keywords: 'settings preferences configuration',
    icon: Settings,
    group: 'Actions',
    action: 'open-settings',
  },
  {
    id: 'about',
    label: 'About',
    keywords: 'about roadwatch platform version',
    icon: Info,
    group: 'Information',
    action: 'open-settings',
  },
]
