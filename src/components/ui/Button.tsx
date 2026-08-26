import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/cn';

export const buttonVariants = cva(
  'inline-flex cursor-pointer items-center justify-center rounded-md font-semibold tracking-[0.03em] uppercase transition-[scale,background-color] duration-120 ease-out active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-500',
  {
    variants: {
      variant: {
        default:
          'bg-background-200 text-font-800 dark:bg-background-800 dark:text-font-100 [@media(hover:hover)]:hover:bg-background-300 [@media(hover:hover)]:dark:hover:bg-background-700',
        primary:
          'bg-background-100 text-font-800 dark:bg-background-700 dark:text-font-100 [@media(hover:hover)]:hover:bg-background-200 [@media(hover:hover)]:dark:hover:bg-background-800',
        // No color of its own: for callers supplying a full background
        // treatment (e.g. a per-type accent color) that a dark: variant of
        // the other variants would otherwise outrank regardless of source
        // order, since :where(.dark, .dark *) still ties on specificity.
        unstyled: '',
      },
      size: {
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10 rounded-full p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
);
Button.displayName = 'Button';
