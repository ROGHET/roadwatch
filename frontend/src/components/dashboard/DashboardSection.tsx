import { type ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import { SectionHeader } from '../common/SectionHeader'

export type DashboardSectionProps = {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
}

export function DashboardSection({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
}: DashboardSectionProps) {
  return (
    <section
      className={twMerge('flex flex-col gap-4', className)}
      aria-label={title}
    >
      <SectionHeader
        title={title}
        description={description}
        action={action}
        titleClassName="text-lg"
      />
      <div className={twMerge('min-w-0', contentClassName)}>{children}</div>
    </section>
  )
}
