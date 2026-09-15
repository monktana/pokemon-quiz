import React from 'react';
import { useCallback, useEffect, useRef } from 'react';

import { useMatchup, usePrefetchMatchup } from '@/api';
import { TypeEffectiveness, type Matchup, type Pokemon } from '@/api/schema';
import { useLocalization } from '@/hooks';
import {
  bucketizeEffectiveness,
  calculateEffectivenessMultiplier,
} from '@/lib/calculateEffectiveness';
import { cn } from '@/lib/cn';
import { recordMatchupHistory, resetMatchupHistory } from '@/lib/matchupHistory';
import { useAppStateActions, useDifficultyMode, useLanguage, useScoreActions } from '@/stores';
import { type TextKey } from '@/util';

import {
  getResourceName,
  Pokemon as PokemonPanel,
  PokemonName,
  PokemonSprite,
  PokemonTags,
  Question,
  Score,
  Team,
  TypeTag,
  useRoundLifecycle,
  type Guess,
  type types,
} from '../';

// How long to hold the last team member's now-fainted indicator on screen
// before cutting to Game Over, so the "all 6 fainted" frame gets its own
// paint instead of being batched away with whatever comes after it.
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

const EFFECTIVENESS_TEXT_KEYS: Record<TypeEffectiveness, TextKey> = {
  [TypeEffectiveness.NoEffect]: 'types.effectiveness.noeffect',
  [TypeEffectiveness.NotVeryEffective]: 'types.effectiveness.noteffective',
  [TypeEffectiveness.Effective]: 'types.effectiveness.effective',
  [TypeEffectiveness.SuperEffective]: 'types.effectiveness.supereffective',
};

// Bundles "what kind of question this round asks" with its correct answer,
// so consumers read `kind` off one value instead of re-deriving it.
type RoundQuestion =
  | { kind: 'multiplier'; correctAnswer: number }
  | { kind: 'bucket'; correctAnswer: TypeEffectiveness };

export type BattleProps = {
  team: Pokemon[];
};

export function Battle({ team }: BattleProps) {
  const lifecycle = useRoundLifecycle(team);
  const { round, activeId, koIds, outcome, feedback, submitGuess } = lifecycle;

  // One Battle mount = one game (see App.tsx, which only renders Game while
  // appState is 'quiz'), so this is the right place to start the repeat
  // penalty tracking fresh instead of carrying it over from a prior game.
  //
  // This can't be a useEffect: useMatchup below is a useSuspenseQuery, and
  // Suspense fetches are kicked off synchronously during render (it throws
  // the in-flight promise) - before any effect from this component's first
  // successful commit would ever run. A mount effect would reset the
  // history only *after* round 1 had already been generated against
  // whatever was left over from the previous game. Mutating a ref directly
  // during render, guarded so it only fires once, is React's documented
  // pattern for exactly this "must happen before the first render's work"
  // ordering requirement.
  const hasResetHistory = useRef(false);
  if (!hasResetHistory.current) {
    hasResetHistory.current = true;
    resetMatchupHistory();
  }

  const { data: matchup, isFetching } = useMatchup(round, activeId);

  // Same reasoning as the reset above, in the other direction: this must
  // run *before* usePrefetchMatchup for round + 1 right below, so that
  // prefetch's repeat-penalty weighting already accounts for the round
  // we're about to show. A useEffect would run after that prefetch call
  // already fired, making every round's penalty one round stale. Recording
  // here instead of inside generateMatchup also means a discarded prefetch
  // (e.g. for the Pokemon active before a switch/faint) never pollutes the
  // history with a matchup the player never actually saw - only a matchup
  // that reaches this line is about to be rendered.
  //
  // react-query keeps the `data` reference stable across re-renders as long
  // as the underlying data hasn't changed, so comparing by reference (not a
  // round/activeId key) is enough to record each shown round exactly once,
  // even though Battle re-renders many times per round (feedback, timers).
  const recordedMatchupRef = useRef<Matchup | null>(null);
  if (recordedMatchupRef.current !== matchup) {
    recordedMatchupRef.current = matchup;
    recordMatchupHistory(matchup.move!.type!.id!, matchup.effectiveness!);
  }

  usePrefetchMatchup(round + 1, activeId);

  const language = useLanguage();
  const { getText, getTemplatedText } = useLocalization();
  const { endQuiz } = useAppStateActions();
  const { increase } = useScoreActions();
  const mode = useDifficultyMode();

  // Single source of truth for "what kind of question is this round", so the
  // answer-correctness check and the answer buttons below can't drift apart
  // by independently re-deriving it from mode.
  const question: RoundQuestion =
    mode === 'expert'
      ? { kind: 'multiplier', correctAnswer: matchup.multiplier! }
      : { kind: 'bucket', correctAnswer: matchup.effectiveness! };

  // The round lifecycle only reports *who* fainted/is incoming (an id) - all
  // localization and name lookup stays here, alongside every other getText
  // call in this file.
  const faintedName =
    outcome.kind === 'fainted'
      ? getResourceName(team.find((pokemon) => pokemon.id === outcome.attackerId)!.species!.names!, language)
      : null;
  const incomingName =
    outcome.kind === 'switching'
      ? getResourceName(team.find((pokemon) => pokemon.id === outcome.incomingId)!.species!.names!, language)
      : null;

  // Once the last team member has fainted, the lifecycle reports 'ending'
  // and stops - leaving the quiz is a Quiz-level concern, one scope above a
  // Round, so it's handled here rather than inside useRoundLifecycle.
  useEffect(() => {
    if (outcome.kind !== 'ending') return;
    const timeout = setTimeout(endQuiz, GAME_OVER_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [outcome.kind, endQuiz]);

  const handleGuess = useCallback(
    (guess: Guess) => {
      const { correct } = submitGuess(guess, question.correctAnswer);
      if (correct) increase();
    },
    [submitGuess, question.correctAnswer, increase]
  );

  const answerButton = (guess: Guess, testId: string, label: string) => {
    const isAnswered = feedback?.guess === guess;
    // On a wrong guess, also reveal which button was the correct answer -
    // otherwise a miss only shows "wrong" without teaching the matchup.
    const revealsCorrectAnswer =
      feedback !== null && !feedback.correct && guess === question.correctAnswer;
    const isHighlighted = isAnswered || revealsCorrectAnswer;
    const isCorrectHighlight = isAnswered ? feedback!.correct : revealsCorrectAnswer;

    return (
      <button
        type="button"
        data-testid={testId}
        disabled={isFetching || outcome.kind !== 'answering'}
        onClick={() => handleGuess(guess)}
        className={cn(
          'border-surface-border bg-surface text-foreground min-h-14 cursor-pointer rounded-md border text-sm font-semibold tracking-[0.03em] uppercase',
          'transition-[scale,background-color,border-color] duration-120 ease-out active:scale-[0.96]',
          'disabled:cursor-not-allowed',
          'focus-visible:ring-border-500 focus-visible:ring-2 focus-visible:outline-none',
          // Excluded (not just overridden) while this button shows a guess
          // result: :hover has higher specificity than a plain bg-* utility
          // and stays matched on a disabled button if the cursor never left
          // it, which otherwise painted over the feedback color right after
          // the click that triggered it.
          isHighlighted
            ? isCorrectHighlight
              ? 'bg-feedback-correct'
              : 'bg-feedback-incorrect text-white'
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
        {outcome.kind === 'fainted' ? (
          <div
            data-testid="fainted-message"
            className="text-foreground border-surface-border bg-surface flex w-full flex-col items-center gap-2 rounded-md border p-4 text-center shadow-[0_1px_3px_rgba(0,0,0,0.10)] sm:p-5 dark:shadow-none"
          >
            <div className="flex flex-wrap items-center justify-center gap-1 text-lg">
              {getTemplatedText('game.status.fainted', <span key="fainted-name">{faintedName}</span>)}
            </div>
            {question.kind === 'bucket' ? (
              // Simple mode only asks for the combined bucket, so a miss
              // doesn't explain itself - break the combined result back down
              // per defending type (e.g. dual-type Pokemon, where one type's
              // resistance can hide behind the other's weakness).
              <div
                data-testid="effectiveness-explanation"
                className="flex flex-col items-center gap-1 text-sm"
              >
                {matchup.defender!.types!.map((defendingType) => {
                  const bucket = bucketizeEffectiveness(
                    calculateEffectivenessMultiplier(matchup.move!.type!, [defendingType])
                  );
                  return (
                    <div
                      key={defendingType.id}
                      className="flex flex-wrap items-center justify-center gap-1"
                    >
                      <TypeTag
                        type={matchup.move!.type!.name as types}
                        text={matchup.move!.type!.names!}
                      />
                      <span aria-hidden="true">→</span>
                      <TypeTag type={defendingType.name as types} text={defendingType.names!} />
                      <span>: {getText(EFFECTIVENESS_TEXT_KEYS[bucket])}</span>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        ) : outcome.kind === 'switching' ? (
          <div
            data-testid="switch-message"
            className="text-foreground border-surface-border bg-surface flex w-full items-center justify-center gap-1 rounded-md border p-4 text-center text-lg shadow-[0_1px_3px_rgba(0,0,0,0.10)] sm:p-5 dark:shadow-none"
          >
            {getTemplatedText('game.status.switched', <span key="switched-name">{incomingName}</span>)}
          </div>
        ) : (
          <Question pokemon={matchup.attacker!} move={matchup.move!} />
        )}
        {question.kind === 'multiplier' ? (
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
