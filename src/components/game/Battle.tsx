import React from 'react';
import { useCallback, useEffect, useState, useTransition } from 'react';

import { useMatchup, usePrefetchMatchup } from '@/api';
import { TypeEffectiveness, type Pokemon } from '@/api/schema';
import { useLocalization } from '@/hooks';
import { cn } from '@/lib/cn';
import { useAppStateActions, useScoreActions } from '@/stores';

import {
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

const FEEDBACK_DURATION_MS = 400;

type Feedback = { guess: TypeEffectiveness; correct: boolean };

export type BattleProps = {
  team: Pokemon[];
};

export function Battle({ team }: BattleProps) {
  const [round, setRound] = useState<number>(1);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const { activeId, koIds, faintActive } = useTeam(team);

  const { data: matchup, isFetching } = useMatchup(round, activeId);
  usePrefetchMatchup(round + 1, activeId);

  const { getText } = useLocalization();
  const { endQuiz } = useAppStateActions();
  const { increase } = useScoreActions();
  const { makeGuess } = useGuess(matchup);

  useEffect(() => {
    if (!feedback) return;
    const timeout = setTimeout(() => setFeedback(null), FEEDBACK_DURATION_MS);
    return () => clearTimeout(timeout);
  }, [feedback]);

  const handleGuess = useCallback(
    (guess: TypeEffectiveness) => {
      const correct = makeGuess(guess);
      setFeedback({ guess, correct });

      if (correct) {
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

  const answerButton = (guess: TypeEffectiveness, testId: string, label: string) => {
    const isAnswered = feedback?.guess === guess;

    return (
      <button
        type="button"
        data-testid={testId}
        disabled={isFetching || isPending}
        onClick={() => handleGuess(guess)}
        className={cn(
          'border-surface-border bg-surface text-foreground min-h-14 cursor-pointer rounded-md border text-sm font-semibold tracking-[0.03em] uppercase',
          'transition-[scale,background-color,border-color] duration-120 ease-out active:scale-[0.96]',
          'disabled:cursor-not-allowed',
          'focus-visible:ring-border-500 focus-visible:ring-2 focus-visible:outline-none',
          // Excluded (not just overridden) while this button shows its guess
          // result: :hover has higher specificity than a plain bg-* utility
          // and stays matched on a disabled button if the cursor never left
          // it, which otherwise painted over the feedback color right after
          // the click that triggered it.
          isAnswered
            ? (feedback!.correct ? 'bg-feedback-correct' : 'bg-feedback-incorrect text-white')
            : [
                '[@media(hover:hover)]:hover:bg-bezel [@media(hover:hover)]:hover:border-bezel-border',
                'disabled:opacity-60',
              ]
        )}
      >
        {label}
      </button>
    );
  };

  return (
    <div
      data-testid="game-container"
      className="bg-bezel border-bezel-border w-full rounded-lg border-2 p-3 sm:p-4"
    >
      <div className="bg-canvas flex w-full flex-col gap-4 rounded-md p-2 sm:p-3">
        <div className="flex w-full items-center justify-between">
          <Score className="text-foreground text-sm font-semibold tracking-[0.04em] uppercase" />
          <Team team={team} koIds={koIds} activeId={activeId} />
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
          <div className="text-foreground flex min-w-0 max-w-full flex-col items-start gap-1">
            <PokemonName data-testid="defender-name" />
            <PokemonTags />
          </div>
        </PokemonPanel>
        <PokemonPanel
          pokemon={matchup.attacker!}
          className="flex-row"
          data-testid="attacker-pokemon"
        >
          <PokemonSprite
            data-testid="attacker-sprite"
            src={matchup.attacker!.sprites?.back_default ?? ''}
          />
          <div className="text-foreground flex min-w-0 max-w-full flex-col items-start gap-1">
            <PokemonName data-testid="attacker-name" />
            <PokemonTags />
          </div>
        </PokemonPanel>
        <Question pokemon={matchup.attacker!} move={matchup.move!} />
        <div data-testid="decision-buttons" className="grid w-full grid-cols-2 gap-2">
          {answerButton(
            TypeEffectiveness.NoEffect,
            'no-effect-button',
            getText('types.effectiveness.noeffect')
          )}
          {answerButton(
            TypeEffectiveness.NotVeryEffective,
            'not-effective-button',
            getText('types.effectiveness.noteffective')
          )}
          {answerButton(
            TypeEffectiveness.Effective,
            'effective-button',
            getText('types.effectiveness.effective')
          )}
          {answerButton(
            TypeEffectiveness.SuperEffective,
            'super-effective-button',
            getText('types.effectiveness.supereffective')
          )}
        </div>
      </div>
    </div>
  );
}
