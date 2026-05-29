import { motion, useReducedMotion } from 'framer-motion'
import { type ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import { SectionHeader } from '../common/SectionHeader'
import { fadeInUp } from '../../lib/motion'

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
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.section
      className={twMerge('flex flex-col gap-4', className)}
      aria-label={title}
      variants={prefersReducedMotion ? undefined : fadeInUp}
      initial={prefersReducedMotion ? false : 'hidden'}
      whileInView={prefersReducedMotion ? undefined : 'visible'}
      viewport={{ once: true, margin: '-48px' }}
    >
      <SectionHeader
        title={title}
        description={description}
        action={action}
        titleClassName="text-lg"
      />
      <div className={twMerge('min-w-0', contentClassName)}>{children}</div>
    </motion.section>
  )
}
