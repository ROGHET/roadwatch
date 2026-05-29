import { cva, type VariantProps } from 'class-variance-authority'
import { type HTMLAttributes } from 'react'
import { twMerge } from 'tailwind-merge'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900',
        secondary:
          'border-transparent bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50',
        outline: 'border-slate-300 text-slate-900 dark:border-slate-600 dark:text-slate-50',
        success:
          'border-transparent bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100',
        warning:
          'border-transparent bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100',
        danger:
          'border-transparent bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-100',
        info:
          'border-transparent bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-100',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={twMerge(badgeVariants({ variant }), className)} {...props} />
}
