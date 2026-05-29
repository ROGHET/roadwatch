import { cva, type VariantProps } from 'class-variance-authority'
import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { twMerge } from 'tailwind-merge'

const premiumButtonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium transition-[background-color,border-color,color,transform,box-shadow] duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--st-primary)] active:scale-95 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'rounded-full bg-[var(--st-primary-container)] text-[var(--st-on-primary-container)] shadow-[var(--st-shadow-fab)] hover:-translate-y-0.5 hover:brightness-110',
        glass:
          'rw-glass-button rounded-full border border-[var(--st-outline-white)] text-[var(--st-on-surface)] hover:-translate-y-0.5',
        ghost:
          'rounded-full text-[var(--st-on-surface-variant)] hover:bg-white/10 hover:text-[var(--st-primary)]',
        outline:
          'rounded-full border border-[var(--st-outline-white)] bg-transparent text-[var(--st-on-surface)] hover:bg-white/10',
      },
      size: {
        sm: 'h-9 px-4 text-xs',
        md: 'h-11 px-5 text-sm',
        lg: 'h-12 px-6 text-sm',
        icon: 'size-11',
        fab: 'size-14',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

export type PremiumButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof premiumButtonVariants> & {
    to?: LinkProps['to']
  }

export const PremiumButton = forwardRef<HTMLButtonElement, PremiumButtonProps>(
  ({ className, variant, size, type = 'button', to, children, disabled, ...props }, ref) => {
    const classes = twMerge(premiumButtonVariants({ variant, size }), className)

    if (to) {
      return (
        <Link
          ref={ref as never}
          to={to}
          className={twMerge(classes, disabled && 'pointer-events-none opacity-50')}
          aria-disabled={disabled || undefined}
        >
          {children}
        </Link>
      )
    }

    return (
      <button ref={ref} type={type} className={classes} disabled={disabled} {...props}>
        {children}
      </button>
    )
  },
)

PremiumButton.displayName = 'PremiumButton'
