import { useSuspenseQuery } from '@tanstack/react-query';
import { useRef } from 'react';

import { Matchup } from '@/api';
import { preloadImage, queryClient } from '@/lib';
import { generateMatchup } from '@/lib/generateMatchup';
import { recordMatchupHistory, resetMatchupHistory } from '@/lib/matchupHistory';

const queryKey = 'matchup';
const staleTime = 10 * 1000;

const getMatchup = async (attackerId: number): Promise<Matchup> => generateMatchup(attackerId);

export const useMatchup = (round: number, attackerId: number) => {
  // One Battle mount = one game, and this is always the first thing that
  // touches matchup-fetching each render (before usePrefetchMatchup), so
  // this ref-guard's lifetime matches "one game" exactly - it lives on the
  // calling component's fiber like any other hook state, regardless of
  // which file defines it.
  //
  // This can't be a useEffect: useSuspenseQuery kicks off its fetch
  // synchronously during render (it throws the in-flight promise) - before
  // any effect from a successful commit would ever run. A mount effect
  // would reset the history only *after* round 1 had already been
  // generated against whatever was left over from the previous game.
  //
  // May call resetMatchupHistory() more than once while this first fetch is
  // settling - React discards a Suspense render attempt's hook state
  // entirely if it doesn't commit, so a fresh (false) ref, and another
  // reset call, can happen a few times before the attempt that finally
  // succeeds. Harmless: recordMatchupHistory only ever runs further down,
  // after a *non-throwing* return from useSuspenseQuery, so it can never
  // land in between two of these redundant resets before the first commit.
  // See docs/adr/0004-matchup-history-reset-can-fire-more-than-once.md.
  const hasResetHistory = useRef(false);
  if (!hasResetHistory.current) {
    hasResetHistory.current = true;
    resetMatchupHistory();
  }

  const result = useSuspenseQuery({
    queryKey: [queryKey, round, attackerId],
    queryFn: () => getMatchup(attackerId),
    staleTime: staleTime,
  });

  // Recording here - keyed on the resolved `data` reference actually
  // reaching this render - rather than inside generateMatchup itself, means
  // a discarded prefetch (e.g. for the Pokemon active before a switch/faint
  // changes the next round's attacker) never pollutes the repeat-penalty
  // streaks with a matchup the player never saw. See
  // docs/adr/0001-matchup-history-recording-stays-at-consumption-time.md.
  const recordedMatchupRef = useRef<Matchup | null>(null);
  if (recordedMatchupRef.current !== result.data) {
    recordedMatchupRef.current = result.data;
    recordMatchupHistory(result.data.move!.type!.id!, result.data.effectiveness!);
  }

  return result;
};

export const usePrefetchMatchup = async (round: number, attackerId: number) => {
  const key = [queryKey, round, attackerId];
  await queryClient.prefetchQuery({
    queryKey: key,
    queryFn: () => getMatchup(attackerId),
    staleTime: staleTime,
  });

  // The defender is drawn fresh from the full dataset each round (unlike
  // the player's own team), so its sprite is the one image that genuinely
  // needs a network fetch every time. Warm it as soon as we know which
  // Pokemon that'll be, instead of waiting for the round to actually start.
  const spriteUrl = queryClient.getQueryData<Matchup>(key)?.defender?.sprites?.front_default;
  if (spriteUrl) preloadImage(spriteUrl);
};

export const useCancelMatchup = async () => {
  return await queryClient.cancelQueries({ queryKey: [queryKey] });
};
