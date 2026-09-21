import { useCallback, useState, useTransition } from 'react';

import type { Pokemon, TypeEffectiveness } from '@/api/schema';

import { useTeam } from './useTeam';

export type Guess = TypeEffectiveness | number;

export type Feedback = { guess: Guess; correct: boolean };

// Bundles "what's currently happening this round" into one value, so
// rendering and the answer-buttons' disabled check both read a single
// source of truth instead of juggling several booleans that could drift.
export type RoundOutcome =
  | { kind: 'answering' }
  // A correct guess with no team switch has no message of its own to show,
  // but still needs to block input for the brief, network-bound moment
  // before the next round's matchup is ready - same "no message, just not
  // interactive" shape as 'ending' below, just a different downstream
  // meaning for the caller (nothing further vs. the game ending).
  | { kind: 'advancing' }
  | { kind: 'switching'; incomingId: number }
  | { kind: 'fainted'; attackerId: number }
  | { kind: 'ending' };

// Long enough to read both the fainted message and which answer button lit
// up as the correct one.
const FAINT_MESSAGE_DURATION_MS = 1600;
// Shorter than the faint message: a voluntary switch has nothing to explain,
// just enough time to read "Go! <name>" before the next round loads.
const SWITCH_MESSAGE_DURATION_MS = 900;
// How long a correct guess with no switch keeps its green highlight before
// fading - the only path with no message of its own to hold it up instead.
const FEEDBACK_DURATION_MS = 400;

/**
 * Owns one game's round-by-round progression: which round it is, who's
 * attacking, and what a guess resolves into (still answering, advancing,
 * a team switch, a faint, or the game ending). Composes useTeam internally
 * rather than accepting its callbacks as parameters - useTeam has exactly
 * one caller, so injecting them would be a hypothetical seam, not a real
 * one. Callers submit a guess and react to `outcome`/`feedback` changing on
 * their own schedule; all round-scoped timing lives here. Deliberately does
 * NOT know about matchup-fetching, localization, or global app/score state -
 * see docs/adr for why those stay out.
 */
export const useRoundLifecycle = (team: Pokemon[]) => {
  const { activeId, koIds, faintActive, maybeSwitchActive, switchActiveTo } = useTeam(team);
  const [round, setRound] = useState(1);
  const [outcome, setOutcome] = useState<RoundOutcome>({ kind: 'answering' });
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [, startTransition] = useTransition();

  const submitGuess = useCallback(
    (guess: Guess, correctAnswer: Guess): { correct: boolean } => {
      const correct = guess === correctAnswer;
      const thisFeedback = { guess, correct };
      setFeedback(thisFeedback);

      if (correct) {
        const incomingId = maybeSwitchActive();
        if (incomingId !== null) {
          setOutcome({ kind: 'switching', incomingId });
          setTimeout(() => {
            // activeId changes together with the round increment, in the
            // same transition, so the query for the new (round, activeId)
            // pair resolves in the background instead of suspending on the
            // spot and cutting the switch message short.
            startTransition(() => {
              switchActiveTo(incomingId);
              setFeedback(null);
              setOutcome({ kind: 'answering' });
              setRound((currentRound) => currentRound + 1);
            });
          }, SWITCH_MESSAGE_DURATION_MS);
        } else {
          setOutcome({ kind: 'advancing' });
          // The only path with no message overlay of its own to hold the
          // highlight up (switching/fainted clear feedback as part of
          // resolving their own timeout above/below), so it needs its own
          // timer to fade it instead - scheduled directly here, not via a
          // useEffect keyed on `outcome`. That was tried first and was
          // buggy: once this same transition resolves to 'answering', the
          // effect's dependency changes, its cleanup cancels the pending
          // timeout, and the re-run's guard skips rescheduling - so if the
          // transition settles before FEEDBACK_DURATION_MS (routine even
          // outside tests, e.g. a warm cache), feedback never clears and
          // hangs over into the next round. Guarded by reference identity
          // so a later guess's feedback (already showing by then, since
          // buttons re-enable the moment the transition resolves) can't be
          // wiped by this stale timer once it does fire.
          setTimeout(() => {
            setFeedback((current) => (current === thisFeedback ? null : current));
          }, FEEDBACK_DURATION_MS);
          startTransition(() => {
            setOutcome({ kind: 'answering' });
            setRound((currentRound) => currentRound + 1);
          });
        }
        return { correct: true };
      }

      setOutcome({ kind: 'fainted', attackerId: activeId });
      // Hold the fainted Pokemon on screen for a beat before resolving
      // faintActive()/advancing the round, so the KO reads as an event
      // instead of an instant, unexplained swap.
      setTimeout(() => {
        startTransition(() => {
          setFeedback(null);
          const nextActiveId = faintActive();
          if (nextActiveId === null) {
            setOutcome({ kind: 'ending' });
            return;
          }
          setOutcome({ kind: 'answering' });
          setRound((currentRound) => currentRound + 1);
        });
      }, FAINT_MESSAGE_DURATION_MS);
      return { correct: false };
    },
    [activeId, faintActive, maybeSwitchActive, switchActiveTo]
  );

  return { round, activeId, koIds, outcome, feedback, submitGuess };
};
