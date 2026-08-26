import React, { HTMLAttributes, ReactNode } from 'react';

import type { Pokemon } from '@/api/schema';

import { PokemonContextProvider } from '@/components/pokemon/pokemon-context';
import { cn } from '@/lib/cn';

export type PokemonProps = HTMLAttributes<HTMLDivElement> & {
  pokemon: Pokemon;
  children?: ReactNode | undefined;
};

export function Pokemon({ pokemon, children, className, ...props }: PokemonProps) {
  const primaryType = pokemon.types?.[0]?.name;

  return (
    <PokemonContextProvider value={pokemon}>
      <div
        data-type={primaryType}
        className="border-(--type-muted) bg-(--type-subtle) animate-panel-enter relative overflow-hidden rounded-lg border"
      >
        <div className="bg-(--type-solid) h-1 w-full" />
        <div
          className={cn(
            'flex w-full items-center justify-center gap-4 p-4 sm:gap-6 sm:p-6',
            className
          )}
          {...props}
        >
          {children}
        </div>
      </div>
    </PokemonContextProvider>
  );
}
