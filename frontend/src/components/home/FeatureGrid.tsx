import { type LucideIcon } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../common/Card'
import { SectionHeader } from '../common/SectionHeader'

export type FeatureItem = {
  icon: LucideIcon
  title: string
  description: string
}

export type FeatureGridProps = {
  title?: string
  description?: string
  features: FeatureItem[]
  columns?: 2 | 3
  className?: string
}

const columnClassName: Record<NonNullable<FeatureGridProps['columns']>, string> = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
}

export function FeatureGrid({
  title,
  description,
  features,
  columns = 3,
  className,
}: FeatureGridProps) {
  return (
    <section className={twMerge('flex flex-col gap-6', className)} aria-label={title ?? 'Features'}>
      {title ? <SectionHeader title={title} description={description} /> : null}
      <ul
        className={twMerge('grid gap-4', columnClassName[columns])}
        role="list"
      >
        {features.map((feature) => {
          const Icon = feature.icon

          return (
            <li key={feature.title} role="listitem">
              <Card className="h-full">
                <CardHeader>
                  <div
                    className="mb-3 flex size-10 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800"
                    aria-hidden="true"
                  >
                    <Icon className="size-5 text-slate-700 dark:text-slate-300" />
                  </div>
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
