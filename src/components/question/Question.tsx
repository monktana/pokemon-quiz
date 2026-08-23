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
      className="text-foreground border-border-500 bg-background-200 dark:border-border-100 dark:bg-background-800 flex w-full items-center gap-1 rounded-md border p-2"
    >
      <div className="flex gap-2 text-xl">
        {getTemplatedText(
          'game.question.effectiveness',
          <span key={attacker.species!.name}>
            {getResourceName(attacker.species!.names!, language)!}
          </span>,
          <TypeTag key={move.type!.name} type={move.type!.name as types} text={move.names!} />
        )}
      </div>
    </div>
  );
}
