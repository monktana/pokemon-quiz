import React from 'react';

import type { Pokemon } from '@/api/schema';
import { Pokeball } from '@/components';

export type TeamProps = {
  team: Pokemon[];
  koIds: number[];
};

export function Team({ team, koIds }: TeamProps) {
  return (
    <div data-testid="team-status" className="flex gap-1">
      {team.map((pokemon) => {
        const fainted = koIds.includes(pokemon.id!);
        return (
          <Pokeball
            key={pokemon.id}
            size="sm"
            fainted={fainted}
            data-testid="team-pokeball"
            data-status={fainted ? 'ko' : 'ok'}
          />
        );
      })}
    </div>
  );
}
