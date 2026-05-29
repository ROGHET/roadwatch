/**
 * RoadWatch primitive design tokens.
 * Dark-mode-first primitives; pair with semantic tokens in theme.ts.
 */

export const colorPalette = {
  neutral: {
    0: '#ffffff',
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#090e1a',
    1000: '#05070d',
  },
  brand: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },
  info: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
  },
} as const

export const spacing = {
  0: '0px',
  px: '1px',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  11: '2.75rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  44: '11rem',
  48: '12rem',
  56: '14rem',
  64: '16rem',
} as const

export const borderRadius = {
  none: '0px',
  sm: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.25rem',
  full: '9999px',
} as const

export const shadow = {
  none: 'none',
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.04)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
  md: '0 4px 8px -2px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.06)',
  lg: '0 12px 24px -8px rgb(0 0 0 / 0.18), 0 4px 8px -4px rgb(0 0 0 / 0.08)',
  xl: '0 20px 40px -12px rgb(0 0 0 / 0.22), 0 8px 16px -8px rgb(0 0 0 / 0.1)',
  inner: 'inset 0 1px 0 0 rgb(255 255 255 / 0.04)',
  focus: '0 0 0 3px rgb(37 99 235 / 0.35)',
} as const

export const animationDuration = {
  instant: '0ms',
  fast: '120ms',
  normal: '200ms',
  moderate: '280ms',
  slow: '400ms',
  deliberate: '600ms',
} as const

export const animationEasing = {
  standard: 'cubic-bezier(0.2, 0, 0, 1)',
  emphasized: 'cubic-bezier(0.2, 0, 0, 1.2)',
  decelerate: 'cubic-bezier(0, 0, 0, 1)',
  accelerate: 'cubic-bezier(0.3, 0, 1, 1)',
} as const

export const zIndex = {
  hide: -1,
  base: 0,
  raised: 10,
  dropdown: 100,
  sticky: 200,
  header: 300,
  overlay: 400,
  modal: 500,
  popover: 600,
  toast: 700,
  tooltip: 800,
  max: 9999,
} as const

export const typography = {
  fontFamily: {
    sans: "system-ui, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    mono: "ui-monospace, 'Cascadia Code', 'Segoe UI Mono', Consolas, monospace",
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  lineHeight: {
    tight: '1.2',
    snug: '1.35',
    normal: '1.5',
    relaxed: '1.625',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  letterSpacing: {
    tight: '-0.02em',
    normal: '0',
    wide: '0.02em',
    wider: '0.06em',
  },
} as const

export const borderWidth = {
  0: '0px',
  1: '1px',
  2: '2px',
} as const

export const opacity = {
  disabled: 0.5,
  muted: 0.72,
  subtle: 0.56,
  overlay: 0.6,
} as const

export const layout = {
  contentMaxWidth: '72rem',
  proseMaxWidth: '42rem',
  navHeight: '4rem',
  pagePaddingX: spacing[4],
  pagePaddingY: spacing[6],
  sectionGap: spacing[8],
} as const

export const designTokens = {
  colorPalette,
  spacing,
  borderRadius,
  borderWidth,
  shadow,
  animationDuration,
  animationEasing,
  zIndex,
  typography,
  opacity,
  layout,
} as const

export type DesignTokens = typeof designTokens
