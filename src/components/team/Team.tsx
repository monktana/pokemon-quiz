import React from 'react';

import type { Pokemon } from '@/api/schema';
import { Pokeball } from '@/components';
import { cn } from '@/lib/cn';

export type TeamProps = {
  team: Pokemon[];
  koIds: number[];
  activeId?: number;
};

export function Team({ team, koIds, activeId }: TeamProps) {
  return (
    <div data-testid="team-status" className="flex gap-1.5">
      {team.map((pokemon) => {
        const fainted = koIds.includes(pokemon.id!);
        const active = pokemon.id === activeId;
        return (
          <Pokeball
            key={pokemon.id}
            size="sm"
            fainted={fainted}
            data-testid="team-pokeball"
            data-status={fainted ? 'ko' : 'ok'}
            data-type={active ? pokemon.types?.[0]?.name : undefined}
            className={cn(active && 'ring-(--type-solid) ring-offset-canvas ring-2 ring-offset-1')}
          />
        );
      })}
    </div>
  );
}
