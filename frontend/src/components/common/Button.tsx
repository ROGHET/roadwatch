import { cva, type VariantProps } from 'class-variance-authority'
import { forwardRef, type ButtonHTMLAttributes } from 'react'
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
          'bg-[var(--rw-danger)] text-white hover:opacity-90 shadow-sm',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-11 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={twMerge(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
)

Button.displayName = 'Button'
