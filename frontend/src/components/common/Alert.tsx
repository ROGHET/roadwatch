import { cva, type VariantProps } from 'class-variance-authority'
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  type LucideIcon,
} from 'lucide-react'
import { type ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

const alertVariants = cva('flex w-full gap-3 rounded-lg border p-4 text-sm', {
  variants: {
    variant: {
      info: 'border-sky-200 bg-sky-50 text-sky-950 dark:border-sky-900 dark:bg-sky-950/50 dark:text-sky-50',
      success:
        'border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-50',
      warning:
        'border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-50',
      error:
        'border-red-200 bg-red-50 text-red-950 dark:border-red-900 dark:bg-red-950/50 dark:text-red-50',
    },
  },
  defaultVariants: {
    variant: 'info',
  },
})

const alertIcons: Record<NonNullable<VariantProps<typeof alertVariants>['variant']>, LucideIcon> =
  {
    info: Info,
    success: CheckCircle2,
    warning: AlertTriangle,
    error: AlertCircle,
  }

export type AlertProps = VariantProps<typeof alertVariants> & {
  title?: string
  children: ReactNode
  className?: string
  iconClassName?: string
}

export function Alert({
  variant = 'info',
  title,
  children,
  className,
  iconClassName,
}: AlertProps) {
  const Icon = alertIcons[variant ?? 'info']

  return (
    <div
      role="alert"
      className={twMerge(alertVariants({ variant }), className)}
    >
      <Icon
        className={twMerge('mt-0.5 size-5 shrink-0', iconClassName)}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        {title ? <p className="mb-1 font-medium leading-none">{title}</p> : null}
        <div className="text-sm leading-relaxed opacity-90">{children}</div>
      </div>
    </div>
  )
}
