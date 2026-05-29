/**
 * Stitch design system primitives from Design.md / exported screens.
 * Source of truth: stitch_roadwatch_cinematic_map_experience
 */

export const stitchColors = {
  surface: '#131313',
  surfaceDim: '#131313',
  surfaceBright: '#3a3939',
  surfaceContainerLowest: '#0e0e0e',
  surfaceContainerLow: '#1c1b1b',
  surfaceContainer: '#201f1f',
  surfaceContainerHigh: '#2a2a2a',
  surfaceContainerHighest: '#353534',
  onSurface: '#e5e2e1',
  onSurfaceVariant: '#c1c6d6',
  inverseSurface: '#e5e2e1',
  inverseOnSurface: '#313030',
  outline: '#8b919f',
  outlineVariant: '#414753',
  outlineWhite: 'rgba(255, 255, 255, 0.15)',
  surfaceTint: '#acc7ff',
  primary: '#acc7ff',
  onPrimary: '#002f66',
  primaryContainer: '#468fff',
  onPrimaryContainer: '#00285a',
  inversePrimary: '#005cbd',
  secondary: '#ffdb9e',
  onSecondary: '#422d00',
  secondaryContainer: '#feb700',
  onSecondaryContainer: '#6b4b00',
  tertiary: '#00e475',
  onTertiary: '#003918',
  tertiaryContainer: '#00a754',
  onTertiaryContainer: '#003214',
  error: '#ff5252',
  onError: '#690005',
  errorContainer: '#93000a',
  onErrorContainer: '#ffdad6',
  background: '#131313',
  onBackground: '#e5e2e1',
  surfaceVariant: '#353534',
  glassBg: 'rgba(19, 19, 19, 0.65)',
  glassPanel: 'rgba(19, 19, 19, 0.65)',
  glassInteractive: 'rgba(32, 31, 31, 0.7)',
} as const

export const stitchSpacing = {
  floatingOffset: '20px',
  gutter: '16px',
  safeMargin: '24px',
  stackSm: '8px',
  stackMd: '16px',
  stackLg: '32px',
} as const

export const stitchRadius = {
  sm: '0.25rem',
  DEFAULT: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.5rem',
  panel: '24px',
  full: '9999px',
} as const

export const stitchShadow = {
  ambient: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  glass: '0px 60px 40px -10px rgba(0, 0, 0, 0.4)',
  fab: '0 8px 24px rgba(70, 143, 255, 0.4)',
  nav: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
} as const

export const stitchTypography = {
  displayLg: {
    fontFamily: "'Instrument Serif', Georgia, serif",
    fontSize: '48px',
    fontWeight: '400',
    lineHeight: '1.1',
    letterSpacing: '-0.02em',
  },
  headlineMd: {
    fontFamily: "'Instrument Serif', Georgia, serif",
    fontSize: '32px',
    fontWeight: '400',
    lineHeight: '1.2',
  },
  headlineSm: {
    fontFamily: "'Instrument Serif', Georgia, serif",
    fontSize: '24px',
    fontWeight: '400',
    lineHeight: '1.2',
  },
  headlineLgMobile: {
    fontFamily: "'Instrument Serif', Georgia, serif",
    fontSize: '36px',
    fontWeight: '400',
    lineHeight: '1.1',
  },
  bodyLg: {
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: '18px',
    fontWeight: '400',
    lineHeight: '1.6',
    letterSpacing: '-0.01em',
  },
  bodyMd: {
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: '15px',
    fontWeight: '400',
    lineHeight: '1.5',
  },
  labelCaps: {
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: '12px',
    fontWeight: '600',
    lineHeight: '1',
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
  },
  metadata: {
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: '11px',
    fontWeight: '500',
    lineHeight: '1',
  },
} as const

export const stitchGlass = {
  blur: '40px',
  blurMd: '24px',
  blurSm: '16px',
  border: 'rgba(255, 255, 255, 0.12)',
  borderSubtle: 'rgba(255, 255, 255, 0.05)',
  edgeHighlight: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
  gradientHighlight:
    'linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, transparent 100%)',
} as const

export const stitchMotion = {
  spring: {
    type: 'spring' as const,
    stiffness: 380,
    damping: 32,
    mass: 0.9,
  },
  sheet: {
    type: 'spring' as const,
    stiffness: 420,
    damping: 36,
    mass: 1,
  },
  easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
  durationFast: '200ms',
  durationNormal: '300ms',
  durationSheet: '400ms',
} as const

export const stitchTokens = {
  colors: stitchColors,
  spacing: stitchSpacing,
  radius: stitchRadius,
  shadow: stitchShadow,
  typography: stitchTypography,
  glass: stitchGlass,
  motion: stitchMotion,
} as const
