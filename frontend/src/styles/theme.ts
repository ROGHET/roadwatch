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
import { stitchColors, stitchRadius, stitchShadow, stitchSpacing } from './stitchTokens'

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
  background: stitchColors.background,
  backgroundSubtle: stitchColors.surfaceContainerLowest,
  surface: stitchColors.surfaceContainer,
  surfaceRaised: stitchColors.surfaceContainerHigh,
  surfaceMuted: stitchColors.surfaceContainerLow,
  border: stitchColors.outlineWhite,
  borderStrong: 'rgba(255, 255, 255, 0.22)',
  ring: stitchColors.primary,
  textPrimary: stitchColors.onSurface,
  textSecondary: stitchColors.onSurfaceVariant,
  textTertiary: stitchColors.outline,
  textInverse: stitchColors.inverseOnSurface,
  textLink: stitchColors.primary,
  textLinkHover: stitchColors.surfaceTint,
  primary: stitchColors.primaryContainer,
  primaryHover: '#5a9aff',
  primaryForeground: stitchColors.onPrimaryContainer,
  accent: stitchColors.primary,
  accentForeground: stitchColors.onPrimary,
  success: stitchColors.tertiary,
  successSubtle: 'rgb(0 228 117 / 0.12)',
  successForeground: stitchColors.onTertiary,
  warning: stitchColors.secondaryContainer,
  warningSubtle: 'rgb(254 183 0 / 0.12)',
  warningForeground: stitchColors.onSecondaryContainer,
  danger: stitchColors.error,
  dangerSubtle: 'rgb(255 82 82 / 0.12)',
  dangerForeground: stitchColors.onErrorContainer,
  info: stitchColors.primaryContainer,
  infoSubtle: 'rgb(70 143 255 / 0.12)',
  infoForeground: stitchColors.onPrimaryContainer,
  overlay: 'rgb(0 0 0 / 0.72)',
  scrim: 'rgb(0 0 0 / 0.48)',
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

/** Active default theme - dark-mode first. */
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

/** Direct Stitch token CSS variables for glass / typography utilities. */
export function stitchToCssVariables(): Record<string, string> {
  return {
    '--st-background': stitchColors.background,
    '--st-surface': stitchColors.surface,
    '--st-surface-container': stitchColors.surfaceContainer,
    '--st-surface-container-low': stitchColors.surfaceContainerLow,
    '--st-surface-container-high': stitchColors.surfaceContainerHigh,
    '--st-on-surface': stitchColors.onSurface,
    '--st-on-surface-variant': stitchColors.onSurfaceVariant,
    '--st-primary': stitchColors.primary,
    '--st-on-primary': stitchColors.onPrimary,
    '--st-primary-container': stitchColors.primaryContainer,
    '--st-on-primary-container': stitchColors.onPrimaryContainer,
    '--st-secondary': stitchColors.secondary,
    '--st-secondary-container': stitchColors.secondaryContainer,
    '--st-on-secondary-container': stitchColors.onSecondaryContainer,
    '--st-tertiary': stitchColors.tertiary,
    '--st-on-tertiary': stitchColors.onTertiary,
    '--st-error': stitchColors.error,
    '--st-outline': stitchColors.outline,
    '--st-outline-white': stitchColors.outlineWhite,
    '--st-glass-bg': stitchColors.glassBg,
    '--st-shadow-glass': stitchShadow.glass,
    '--st-shadow-fab': stitchShadow.fab,
    '--st-shadow-nav': stitchShadow.nav,
    '--st-radius-panel': stitchRadius.panel,
    '--st-safe-margin': stitchSpacing.safeMargin,
    '--st-floating-offset': stitchSpacing.floatingOffset,
    '--st-stack-sm': stitchSpacing.stackSm,
    '--st-stack-md': stitchSpacing.stackMd,
    '--st-stack-lg': stitchSpacing.stackLg,
    '--st-gutter': stitchSpacing.gutter,
  }
}

export const stitchCssVariables = stitchToCssVariables()
