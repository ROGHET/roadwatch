import { cva, type VariantProps } from 'class-variance-authority'
import { motion, useReducedMotion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { fadeIn } from '../../lib/motion'

const spinnerVariants = cva('text-[var(--rw-primary)]', {
  variants: {
    size: {
      sm: 'size-4',
      md: 'size-6',
      lg: 'size-8',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export type LoadingSpinnerProps = VariantProps<typeof spinnerVariants> & {
  label?: string
  className?: string
}

export function LoadingSpinner({
  size,
  label = 'Loading',
  className,
}: LoadingSpinnerProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={twMerge(
        'inline-flex items-center justify-center rounded-lg border border-[var(--rw-border)] bg-[var(--rw-surface)] p-3',
        className,
      )}
      variants={prefersReducedMotion ? undefined : fadeIn}
      initial={prefersReducedMotion ? false : 'hidden'}
      animate={prefersReducedMotion ? undefined : 'visible'}
    >
      <motion.div
        animate={prefersReducedMotion ? undefined : { rotate: 360 }}
        transition={
          prefersReducedMotion
            ? undefined
            : { duration: 0.9, repeat: Infinity, ease: 'linear' }
        }
        aria-hidden="true"
      >
        <Loader2 className={spinnerVariants({ size })} />
      </motion.div>
      <motion.span
        className="sr-only"
        animate={
          prefersReducedMotion
            ? undefined
            : { opacity: [0.65, 1, 0.65] }
        }
        transition={
          prefersReducedMotion
            ? undefined
            : { duration: 1.4, repeat: Infinity, ease: 'easeInOut' }
        }
      >
        {label}
      </motion.span>
    </motion.div>
  )
}
