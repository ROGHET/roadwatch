import { cva, type VariantProps } from 'class-variance-authority'
import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { twMerge } from 'tailwind-merge'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-[background-color,border-color,color,transform,box-shadow] duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rw-ring)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 disabled:active:scale-100',
  {
    variants: {
      variant: {
        primary:
          'bg-[var(--rw-primary)] text-[var(--rw-primary-foreground)] hover:bg-[var(--rw-primary-hover)] shadow-sm hover:shadow-md',
        secondary:
          'bg-[var(--rw-surface-raised)] text-[var(--rw-text-primary)] hover:bg-[var(--rw-surface-muted)] border border-[var(--rw-border)]',
        outline:
          'border border-[var(--rw-border)] bg-transparent text-[var(--rw-text-primary)] hover:border-[var(--rw-border-strong)] hover:bg-[var(--rw-surface-muted)]',
        ghost:
          'bg-transparent text-[var(--rw-text-primary)] hover:bg-[var(--rw-surface-muted)]',
        danger:
          'bg-[var(--rw-danger)] text-[var(--rw-danger-foreground)] hover:opacity-90 shadow-sm',
      },
      size: {
        sm: 'h-[var(--rw-button-height-sm)] px-[var(--rw-button-padding-sm)] text-sm',
        md: 'h-[var(--rw-button-height-md)] px-[var(--rw-button-padding-md)] text-sm',
        lg: 'h-[var(--rw-button-height-lg)] px-[var(--rw-button-padding-lg)] text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    to?: LinkProps['to']
  }

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = 'button', to, children, disabled, ...props }, ref) => {
    const classes = twMerge(buttonVariants({ variant, size }), className)

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
      <button
        ref={ref}
        type={type}
        className={classes}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'
