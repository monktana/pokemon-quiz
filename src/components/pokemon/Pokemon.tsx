import React, { HTMLAttributes, ReactNode } from 'react';

import type { Pokemon } from '@/api/schema';

import { types } from '@/components/icons/TypeIcon';
import { PokemonContextProvider } from '@/components/pokemon/pokemon-context';
import { cn } from '@/lib/cn';

export type PokemonProps = HTMLAttributes<HTMLDivElement> & {
  pokemon: Pokemon;
  children?: ReactNode | undefined;
  // Colors the panel by a Move Type instead of this Pokemon's own Pokémon
  // Type - used for the attacker panel in Battle, since only the used
  // attack's Move Type is relevant on the attacker's side of a Matchup (see
  // CONTEXT.md). Defaults to the Pokemon's own primary type, correct for a
  // defender panel where the Pokémon Type itself is what's relevant.
  colorType?: types;
};

export function Pokemon({ pokemon, children, className, colorType, ...props }: PokemonProps) {
  const primaryType = colorType ?? pokemon.types?.[0]?.name;

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
