import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { twMerge } from 'tailwind-merge'

const spinnerVariants = cva('animate-spin text-slate-900 dark:text-slate-50', {
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
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={twMerge('inline-flex items-center justify-center', className)}
    >
      <Loader2 className={spinnerVariants({ size })} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  )
}
