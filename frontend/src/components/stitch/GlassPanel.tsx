import { forwardRef, type HTMLAttributes } from 'react'
import { twMerge } from 'tailwind-merge'

export type GlassPanelProps = HTMLAttributes<HTMLDivElement> & {
  edge?: boolean
  interactive?: boolean
}

export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, edge = true, interactive = false, children, ...props }, ref) => (
    <div
      ref={ref}
      className={twMerge(
        'rw-glass-panel',
        edge && 'rw-glass-edge',
        interactive && 'rw-glass-interactive',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
)

GlassPanel.displayName = 'GlassPanel'
