import React, { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/cn';

export const pokeballVariants = cva(
  'relative rounded-full border-black [background:linear-gradient(var(--color-red-500)_0%,var(--color-red-500)_50%,white_50%)] transition-[scale,opacity] duration-200 ease-out',
  {
    variants: {
      size: {
        lg: 'h-80 w-80 border-[6px]',
        sm: 'h-6 w-6 border-2',
      },
      fainted: {
        true: 'grayscale-100 scale-90 opacity-40',
        false: 'scale-100 opacity-100',
      },
    },
    defaultVariants: {
      size: 'lg',
      fainted: false,
    },
  }
);

const innerCircleVariants = cva(
  'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-black bg-white',
  {
    variants: {
      size: {
        lg: 'h-16 w-16 border-[6px]',
        sm: 'h-1.5 w-1.5 border',
      },
    },
    defaultVariants: {
      size: 'lg',
    },
  }
);

export interface PokeballProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof pokeballVariants> {}

export function Pokeball({ className, size, fainted, ...props }: PokeballProps) {
  return (
    <div className={cn(pokeballVariants({ size, fainted }), className)} {...props}>
      <div className={cn(innerCircleVariants({ size }))} />
    </div>
  );
}
