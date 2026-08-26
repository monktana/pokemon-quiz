import React from 'react';
import { useCallback, useEffect, useState, useTransition } from 'react';

import { useMatchup, usePrefetchMatchup } from '@/api';
import { TypeEffectiveness, type Pokemon } from '@/api/schema';
import { useLocalization } from '@/hooks';
import { cn } from '@/lib/cn';
import { useAppStateActions, useLanguage, useScoreActions } from '@/stores';

import {
  getResourceName,
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
const FAINT_MESSAGE_DURATION_MS = 1100;
const GAME_OVER_DELAY_MS = 500;

type Feedback = { guess: TypeEffectiveness; correct: boolean };

export type BattleProps = {
  team: Pokemon[];
};

export function Battle({ team }: BattleProps) {
  const [round, setRound] = useState<number>(1);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [faintMessage, setFaintMessage] = useState<React.ReactNode>(null);
  const [isGameOverPending, setIsGameOverPending] = useState(false);
  const { activeId, koIds, faintActive } = useTeam(team);

  const { data: matchup, isFetching } = useMatchup(round, activeId);
  usePrefetchMatchup(round + 1, activeId);

  const language = useLanguage();
  const { getText, getTemplatedText } = useLocalization();
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

      const faintedName = getResourceName(matchup.attacker!.species!.names!, language);
      setFaintMessage(
        getTemplatedText('game.status.fainted', <span key="fainted-name">{faintedName}</span>)
      );

      // Hold the fainted Pokemon and its message on screen for a beat
      // before resolving faintActive()/advancing the round, so the KO
      // reads as an event instead of an instant, unexplained swap. A wrong
      // guess always switches to a different team member, so the next
      // round's matchup query was never prefetched for it either way;
      // wrapping the resolution in a transition keeps whatever's on screen
      // stable instead of flashing to the Suspense fallback while it loads.
      setTimeout(() => {
        startTransition(() => {
          setFaintMessage(null);
          const nextActiveId = faintActive();
          if (nextActiveId === null) {
            // Give the last Pokemon's now-fainted team indicator its own
            // paint before cutting to Game Over: setting koIds and calling
            // endQuiz() in the same commit would let React batch both
            // together and skip straight past the "all 6 fainted" frame.
            // isGameOverPending keeps the buttons locked through this gap,
            // since faintMessage itself was already cleared above.
            setIsGameOverPending(true);
            setTimeout(() => startTransition(() => endQuiz()), GAME_OVER_DELAY_MS);
            return;
          }

          setRound((round) => round + 1);
        });
      }, FAINT_MESSAGE_DURATION_MS);
    },
    [makeGuess, increase, faintActive, endQuiz, matchup, language, getTemplatedText]
  );

  const answerButton = (guess: TypeEffectiveness, testId: string, label: string) => {
    const isAnswered = feedback?.guess === guess;

    return (
      <button
        type="button"
        data-testid={testId}
        disabled={isFetching || isPending || faintMessage !== null || isGameOverPending}
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
      className={cn(
        'bg-bezel w-full rounded-lg border-2 p-3 ring-4 transition-[border-color,box-shadow] duration-300 sm:p-4',
        feedback
          ? feedback.correct
            ? 'border-feedback-correct ring-feedback-correct/30'
            : 'border-feedback-incorrect ring-feedback-incorrect/30'
          : 'border-bezel-border ring-transparent'
      )}
    >
      <div className="bg-canvas flex w-full flex-col gap-4 rounded-md p-2 sm:p-3">
        <div className="flex w-full items-center justify-between">
          <Score className="text-foreground text-sm font-semibold tracking-[0.04em] uppercase" />
          <Team team={team} koIds={koIds} activeId={activeId} />
        </div>
        <PokemonPanel
          key={matchup.defender!.id}
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
          key={matchup.attacker!.id}
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
        {faintMessage ? (
          <div
            data-testid="fainted-message"
            className="text-foreground border-surface-border bg-surface flex w-full items-center justify-center gap-1 rounded-md border p-4 text-center text-lg shadow-[0_1px_3px_rgba(0,0,0,0.10)] sm:p-5 dark:shadow-none"
          >
            {faintMessage}
          </div>
        ) : (
          <Question pokemon={matchup.attacker!} move={matchup.move!} />
        )}
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
