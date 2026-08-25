import React, { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/cn';

const skeletonVariants = cva(
  'animate-pulse rounded-md border [animation-duration:var(--duration,1.2s)]',
  {
    variants: {
      variant: {
        quiz: 'border-border-500 bg-background-300 dark:border-border-100 dark:bg-background-700',
      },
    },
    defaultVariants: {
      variant: 'quiz',
    },
  }
);

export interface SkeletonProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof skeletonVariants> {}

export const Skeleton = ({ className, variant, ...props }: SkeletonProps) => (
  <div className={cn(skeletonVariants({ variant }), className)} {...props} />
);
