import {
  animationDuration,
  animationEasing,
  borderRadius,
  colorPalette,
  shadow,
  spacing,
  typography,
  zIndex,
} from './designTokens'

/**
 * Semantic theme tokens for RoadWatch.
 * Default appearance is dark (government-tech, high-trust).
 */

export type ThemeMode = 'dark' | 'light'

export type SemanticColors = {
  background: string
  backgroundSubtle: string
  surface: string
  surfaceRaised: string
  surfaceMuted: string
  border: string
  borderStrong: string
  ring: string
  textPrimary: string
  textSecondary: string
  textTertiary: string
  textInverse: string
  textLink: string
  textLinkHover: string
  primary: string
  primaryHover: string
  primaryForeground: string
  accent: string
  accentForeground: string
  success: string
  successSubtle: string
  successForeground: string
  warning: string
  warningSubtle: string
  warningForeground: string
  danger: string
  dangerSubtle: string
  dangerForeground: string
  info: string
  infoSubtle: string
  infoForeground: string
  overlay: string
  scrim: string
}

export type Theme = {
  mode: ThemeMode
  colors: SemanticColors
  spacing: typeof spacing
  borderRadius: typeof borderRadius
  shadow: typeof shadow
  animationDuration: typeof animationDuration
  animationEasing: typeof animationEasing
  zIndex: typeof zIndex
  typography: typeof typography
}

const darkColors: SemanticColors = {
  background: colorPalette.neutral[1000],
  backgroundSubtle: colorPalette.neutral[950],
  surface: colorPalette.neutral[900],
  surfaceRaised: colorPalette.neutral[800],
  surfaceMuted: colorPalette.neutral[950],
  border: 'rgb(148 163 184 / 0.14)',
  borderStrong: 'rgb(148 163 184 / 0.24)',
  ring: colorPalette.brand[500],
  textPrimary: colorPalette.neutral[50],
  textSecondary: colorPalette.neutral[300],
  textTertiary: colorPalette.neutral[400],
  textInverse: colorPalette.neutral[900],
  textLink: colorPalette.brand[400],
  textLinkHover: colorPalette.brand[300],
  primary: colorPalette.brand[600],
  primaryHover: colorPalette.brand[500],
  primaryForeground: colorPalette.neutral[0],
  accent: colorPalette.brand[500],
  accentForeground: colorPalette.neutral[0],
  success: colorPalette.success[500],
  successSubtle: 'rgb(16 185 129 / 0.12)',
  successForeground: colorPalette.success[100],
  warning: colorPalette.warning[500],
  warningSubtle: 'rgb(245 158 11 / 0.12)',
  warningForeground: colorPalette.warning[100],
  danger: colorPalette.danger[500],
  dangerSubtle: 'rgb(239 68 68 / 0.12)',
  dangerForeground: colorPalette.danger[100],
  info: colorPalette.info[500],
  infoSubtle: 'rgb(14 165 233 / 0.12)',
  infoForeground: colorPalette.info[100],
  overlay: 'rgb(5 7 13 / 0.72)',
  scrim: 'rgb(5 7 13 / 0.48)',
}

const lightColors: SemanticColors = {
  background: colorPalette.neutral[50],
  backgroundSubtle: colorPalette.neutral[100],
  surface: colorPalette.neutral[0],
  surfaceRaised: colorPalette.neutral[0],
  surfaceMuted: colorPalette.neutral[100],
  border: 'rgb(15 23 42 / 0.1)',
  borderStrong: 'rgb(15 23 42 / 0.16)',
  ring: colorPalette.brand[600],
  textPrimary: colorPalette.neutral[900],
  textSecondary: colorPalette.neutral[600],
  textTertiary: colorPalette.neutral[500],
  textInverse: colorPalette.neutral[0],
  textLink: colorPalette.brand[700],
  textLinkHover: colorPalette.brand[800],
  primary: colorPalette.brand[700],
  primaryHover: colorPalette.brand[800],
  primaryForeground: colorPalette.neutral[0],
  accent: colorPalette.brand[600],
  accentForeground: colorPalette.neutral[0],
  success: colorPalette.success[600],
  successSubtle: colorPalette.success[50],
  successForeground: colorPalette.success[700],
  warning: colorPalette.warning[600],
  warningSubtle: colorPalette.warning[50],
  warningForeground: colorPalette.warning[700],
  danger: colorPalette.danger[600],
  dangerSubtle: colorPalette.danger[50],
  dangerForeground: colorPalette.danger[700],
  info: colorPalette.info[600],
  infoSubtle: colorPalette.info[50],
  infoForeground: colorPalette.info[700],
  overlay: 'rgb(15 23 42 / 0.4)',
  scrim: 'rgb(15 23 42 / 0.24)',
}

const sharedTheme = {
  spacing,
  borderRadius,
  shadow,
  animationDuration,
  animationEasing,
  zIndex,
  typography,
} as const

/** Default RoadWatch theme (dark-mode first). */
export const darkTheme: Theme = {
  mode: 'dark',
  colors: darkColors,
  ...sharedTheme,
}

/** Light theme companion for accessibility and user preference. */
export const lightTheme: Theme = {
  mode: 'light',
  colors: lightColors,
  ...sharedTheme,
}

/** Active default theme — dark-mode first. */
export const theme = darkTheme

export const themes = {
  dark: darkTheme,
  light: lightTheme,
} as const

export function getTheme(mode: ThemeMode): Theme {
  return themes[mode]
}

/**
 * CSS custom property map for injecting into :root or .dark / .light scopes.
 */
export function themeToCssVariables(colors: SemanticColors): Record<string, string> {
  return {
    '--rw-background': colors.background,
    '--rw-background-subtle': colors.backgroundSubtle,
    '--rw-surface': colors.surface,
    '--rw-surface-raised': colors.surfaceRaised,
    '--rw-surface-muted': colors.surfaceMuted,
    '--rw-border': colors.border,
    '--rw-border-strong': colors.borderStrong,
    '--rw-ring': colors.ring,
    '--rw-text-primary': colors.textPrimary,
    '--rw-text-secondary': colors.textSecondary,
    '--rw-text-tertiary': colors.textTertiary,
    '--rw-text-inverse': colors.textInverse,
    '--rw-text-link': colors.textLink,
    '--rw-text-link-hover': colors.textLinkHover,
    '--rw-primary': colors.primary,
    '--rw-primary-hover': colors.primaryHover,
    '--rw-primary-foreground': colors.primaryForeground,
    '--rw-accent': colors.accent,
    '--rw-accent-foreground': colors.accentForeground,
    '--rw-success': colors.success,
    '--rw-success-subtle': colors.successSubtle,
    '--rw-success-foreground': colors.successForeground,
    '--rw-warning': colors.warning,
    '--rw-warning-subtle': colors.warningSubtle,
    '--rw-warning-foreground': colors.warningForeground,
    '--rw-danger': colors.danger,
    '--rw-danger-subtle': colors.dangerSubtle,
    '--rw-danger-foreground': colors.dangerForeground,
    '--rw-info': colors.info,
    '--rw-info-subtle': colors.infoSubtle,
    '--rw-info-foreground': colors.infoForeground,
    '--rw-overlay': colors.overlay,
    '--rw-scrim': colors.scrim,
  }
}

export const darkThemeCssVariables = themeToCssVariables(darkTheme.colors)
export const lightThemeCssVariables = themeToCssVariables(lightTheme.colors)
