import { useSuspenseQuery } from '@tanstack/react-query';

import { Matchup } from '@/api';
import { preloadImage, queryClient } from '@/lib';
import { generateMatchup } from '@/lib/generateMatchup';

const queryKey = 'matchup';
const staleTime = 10 * 1000;

const getMatchup = async (attackerId: number): Promise<Matchup> => generateMatchup(attackerId);

export const useMatchup = (round: number, attackerId: number) => {
  return useSuspenseQuery({
    queryKey: [queryKey, round, attackerId],
    queryFn: () => getMatchup(attackerId),
    staleTime: staleTime,
  });
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
