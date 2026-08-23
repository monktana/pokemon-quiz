import React, { HTMLAttributes, ReactNode } from 'react';

import type { Pokemon } from '@/api/schema';

import { PokemonContextProvider } from '@/components/pokemon/pokemon-context';
import { cn } from '@/lib/cn';

export type PokemonProps = HTMLAttributes<HTMLDivElement> & {
  pokemon: Pokemon;
  children?: ReactNode | undefined;
};

export function Pokemon({ pokemon, children, className, ...props }: PokemonProps) {
  return (
    <PokemonContextProvider value={pokemon}>
      <div
        className={cn(
          'border-border-500 bg-background-200 dark:border-border-100 dark:bg-background-800 flex w-full items-center rounded-md border p-2',
          className
        )}
        {...props}
      >
        {children}
      </div>
    </PokemonContextProvider>
  );
}
