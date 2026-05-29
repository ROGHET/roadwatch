import type { Transition, Variants } from 'framer-motion'
import { animationDuration } from '../styles/designTokens'
import { stitchMotion } from '../styles/stitchTokens'

export const stitchSpring = stitchMotion.spring
export const stitchSheetSpring = stitchMotion.sheet

const easeStandard = [0.2, 0, 0, 1] as const

function toSeconds(value: string): number {
  if (value.endsWith('ms')) {
    return Number.parseFloat(value) / 1000
  }
  return Number.parseFloat(value) || 0.2
}

export const transitions = {
  fast: {
    duration: toSeconds(animationDuration.fast),
    ease: easeStandard,
  },
  normal: {
    duration: toSeconds(animationDuration.normal),
    ease: easeStandard,
  },
  moderate: {
    duration: toSeconds(animationDuration.moderate),
    ease: easeStandard,
  },
} satisfies Record<string, Transition>

export const springSnappy = {
  type: 'spring',
  stiffness: 420,
  damping: 32,
  mass: 0.8,
} as const

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transitions.normal },
}

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: transitions.normal },
}

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0, transition: transitions.normal },
}

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05,
    },
  },
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.normal,
  },
}

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: transitions.moderate,
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: transitions.fast,
  },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: transitions.normal },
}

export const cardHover = {
  y: -3,
  transition: transitions.fast,
}

export const iconFloat: Variants = {
  initial: { y: 0 },
  animate: {
    y: [0, -3, 0],
    transition: {
      duration: 2.8,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}
