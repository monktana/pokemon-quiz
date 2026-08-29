import React from 'react';
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';

import { useMatchup, usePrefetchMatchup } from '@/api';
import { TypeEffectiveness, type Pokemon } from '@/api/schema';
import { useLocalization } from '@/hooks';
import { cn } from '@/lib/cn';
import {
  useAppStateActions,
  useDifficultyMode,
  useIncludeStab,
  useLanguage,
  useScoreActions,
} from '@/stores';

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
  type Guess,
} from '../';

const FEEDBACK_DURATION_MS = 400;
const FAINT_MESSAGE_DURATION_MS = 1100;
const GAME_OVER_DELAY_MS = 500;

// The precise multiplier a defending type combination can ever produce, per
// calculateEffectivenessMultiplier - shown as answer buttons in expert mode.
const MULTIPLIER_VALUES = [0, 0.25, 0.5, 1, 2, 4] as const;
const MULTIPLIER_LABELS: Record<(typeof MULTIPLIER_VALUES)[number], string> = {
  0: '×0',
  0.25: '×¼',
  0.5: '×½',
  1: '×1',
  2: '×2',
  4: '×4',
};

type Feedback = { guess: Guess; correct: boolean };

// Bundles "what kind of question this round asks" with its correct answer,
// so consumers read `kind` off one value instead of re-deriving it.
type RoundQuestion =
  | { kind: 'stab'; correctAnswer: boolean }
  | { kind: 'multiplier'; correctAnswer: number }
  | { kind: 'bucket'; correctAnswer: TypeEffectiveness };

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
  const mode = useDifficultyMode();
  const includeStab = useIncludeStab();

  // Decided once per round (not per render) so it stays stable while the
  // round is in progress. Only ever a STAB round when the player opted in.
  // Keyed on `round`, not `matchup`, so the question type is picked before
  // the round's data arrives and stays fixed for the round's duration.
  const questionType = useMemo<'effectiveness' | 'stab'>(() => {
    if (!includeStab) return 'effectiveness';
    return Math.random() < 0.5 ? 'stab' : 'effectiveness';
  }, [round, includeStab]);

  // Single source of truth for "what kind of question is this round", so the
  // answer-correctness check and the answer buttons below can't drift apart
  // by independently re-deriving it from questionType/mode.
  const question: RoundQuestion =
    questionType === 'stab'
      ? { kind: 'stab', correctAnswer: matchup.stabEligible! }
      : mode === 'expert'
        ? { kind: 'multiplier', correctAnswer: matchup.multiplier! }
        : { kind: 'bucket', correctAnswer: matchup.effectiveness! };
  const { makeGuess } = useGuess(question.correctAnswer);

  useEffect(() => {
    if (!feedback) return;
    const timeout = setTimeout(() => setFeedback(null), FEEDBACK_DURATION_MS);
    return () => clearTimeout(timeout);
  }, [feedback]);

  const handleGuess = useCallback(
    (guess: Guess) => {
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

  const answerButton = (guess: Guess, testId: string, label: string) => {
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
        {question.kind === 'stab' && !faintMessage ? (
          <div
            data-testid="stab-prompt"
            className="text-foreground text-center text-sm font-semibold tracking-[0.03em] uppercase"
          >
            {getText('game.question.stab')}
          </div>
        ) : null}
        {question.kind === 'stab' ? (
          <div data-testid="decision-buttons" className="grid w-full grid-cols-2 gap-2">
            {answerButton(true, 'stab-yes-button', getText('game.answer.yes'))}
            {answerButton(false, 'stab-no-button', getText('game.answer.no'))}
          </div>
        ) : question.kind === 'multiplier' ? (
          <div data-testid="decision-buttons" className="grid w-full grid-cols-3 gap-2">
            {MULTIPLIER_VALUES.map((value) =>
              answerButton(value, `multiplier-${value}-button`, MULTIPLIER_LABELS[value])
            )}
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
