import { forwardRef, type HTMLAttributes } from 'react'
import { twMerge } from 'tailwind-merge'

export type PageContainerProps = HTMLAttributes<HTMLDivElement> & {
  size?: 'narrow' | 'default' | 'wide' | 'full'
}

const sizeClasses: Record<NonNullable<PageContainerProps['size']>, string> = {
  narrow: 'max-w-2xl',
  default: 'max-w-4xl',
  wide: 'max-w-6xl',
  full: 'max-w-full',
}

export const PageContainer = forwardRef<HTMLDivElement, PageContainerProps>(
  ({ className, size = 'full', ...props }, ref) => (
    <div
      ref={ref}
      className={twMerge(
        'mx-auto flex w-full flex-col gap-6',
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  ),
)

PageContainer.displayName = 'PageContainer'
