import React from 'react';

import { Move, Pokemon } from '@/api/schema';
import { getResourceName, types, TypeTag } from '@/components';
import { useLocalization } from '@/hooks';
import { useLanguage } from '@/stores';

type AttackProps = {
  pokemon: Pokemon;
  move: Move;
};

export function Question({ pokemon: attacker, move }: AttackProps) {
  const language = useLanguage();
  const { getTemplatedText } = useLocalization();

  return (
    <div
      data-testid="question"
      className="text-foreground border-surface-border bg-surface flex w-full items-center justify-center gap-1 rounded-md border p-4 shadow-[0_1px_3px_rgba(0,0,0,0.10)] sm:p-5 dark:shadow-none"
    >
      <div className="flex flex-wrap items-center justify-center gap-2 text-center text-lg text-pretty">
        {getTemplatedText(
          'game.question.effectiveness',
          <span key={attacker.species!.name}>
            {getResourceName(attacker.species!.names!, language)}
          </span>,
          <span key={move.name}>{getResourceName(move.names!, language)}</span>,
          // The Move Type, spelled out - not the attack's own name - is
          // what actually matters for effectiveness (see CONTEXT.md). It
          // used to be implied only by this tag's icon/color while showing
          // the move's name instead, which is easy to miss or misread as
          // the attacker's own Pokémon Type.
          <TypeTag key={move.type!.name} type={move.type!.name as types} text={move.type!.names!} />
        )}
      </div>
    </div>
  );
}
