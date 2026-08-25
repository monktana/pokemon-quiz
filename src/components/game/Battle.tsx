import React from 'react';
import { useCallback, useState, useTransition } from 'react';

import { useMatchup, usePrefetchMatchup } from '@/api';
import { TypeEffectiveness, type Pokemon } from '@/api/schema';
import { useLocalization } from '@/hooks';
import { useAppStateActions, useScoreActions } from '@/stores';

import {
  Button,
  Pokemon as PokemonPanel,
  PokemonName,
  PokemonSprite,
  PokemonTags,
  Question,
  Score,
  Team,
  useGuess,
  useTeam,
} from '../';

export type BattleProps = {
  team: Pokemon[];
};

export function Battle({ team }: BattleProps) {
  const [round, setRound] = useState<number>(1);
  const [isPending, startTransition] = useTransition();
  const { activeId, koIds, faintActive } = useTeam(team);

  const { data: matchup, isFetching } = useMatchup(round, activeId);
  usePrefetchMatchup(round + 1, activeId);

  const { getText } = useLocalization();
  const { endQuiz } = useAppStateActions();
  const { increase } = useScoreActions();
  const { makeGuess } = useGuess(matchup);

  const handleGuess = useCallback(
    (guess: TypeEffectiveness) => {
      if (makeGuess(guess)) {
        increase();
        startTransition(() => {
          setRound((round) => round + 1);
        });
        return;
      }

      // A wrong guess always switches to a different team member, so the
      // next round's matchup query was never prefetched for it. Running the
      // resulting state updates as a transition keeps the current round on
      // screen instead of flashing the whole app to the Suspense fallback
      // while that fresh query resolves.
      startTransition(() => {
        const nextActiveId = faintActive();
        if (nextActiveId === null) {
          endQuiz();
          return;
        }

        setRound((round) => round + 1);
      });
    },
    [makeGuess, increase, faintActive, endQuiz]
  );

  return (
    <div data-testid="game-container" className="flex w-full flex-col items-start gap-2">
      <div className="flex w-full items-center justify-between">
        <Score />
        <Team team={team} koIds={koIds} />
      </div>
      <PokemonPanel
        pokemon={matchup.defender!}
        className="flex-row-reverse"
        data-testid="defender-pokemon"
      >
        <PokemonSprite
          data-testid="defender-sprite"
          src={matchup.defender!.sprites?.front_default ?? ''}
        />
        <div className="text-foreground flex w-full flex-col items-start">
          <PokemonName data-testid="defender-name" />
          <PokemonTags />
        </div>
      </PokemonPanel>
      <PokemonPanel pokemon={matchup.attacker!} className="flex-row" data-testid="attacker-pokemon">
        <PokemonSprite
          data-testid="attacker-sprite"
          src={matchup.attacker!.sprites?.back_default ?? ''}
        />
        <div className="text-foreground flex w-full flex-col items-start">
          <PokemonName data-testid="attacker-name" />
          <PokemonTags />
        </div>
      </PokemonPanel>
      <Question pokemon={matchup.attacker!} move={matchup.move!} />
      <div
        data-testid="decision-buttons"
        className="border-border-500 bg-background-200 dark:border-border-100 dark:bg-background-800 grid w-full grid-cols-2 gap-2 rounded-md border p-2"
      >
        <Button
          data-testid="no-effect-button"
          disabled={isFetching || isPending}
          onClick={() => handleGuess(TypeEffectiveness.NoEffect)}
        >
          {getText('types.effectiveness.noeffect')}
        </Button>
        <Button
          data-testid="not-effective-button"
          disabled={isFetching || isPending}
          onClick={() => handleGuess(TypeEffectiveness.NotVeryEffective)}
        >
          {getText('types.effectiveness.noteffective')}
        </Button>
        <Button
          data-testid="effective-button"
          disabled={isFetching || isPending}
          onClick={() => handleGuess(TypeEffectiveness.Effective)}
        >
          {getText('types.effectiveness.effective')}
        </Button>
        <Button
          data-testid="super-effective-button"
          disabled={isFetching || isPending}
          onClick={() => handleGuess(TypeEffectiveness.SuperEffective)}
        >
          {getText('types.effectiveness.supereffective')}
        </Button>
      </div>
    </div>
  );
}
