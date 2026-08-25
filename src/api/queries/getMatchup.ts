import { useSuspenseQuery } from '@tanstack/react-query';

import { Matchup } from '@/api';
import { queryClient } from '@/lib';
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
  return await queryClient.prefetchQuery({
    queryKey: [queryKey, round, attackerId],
    queryFn: () => getMatchup(attackerId),
    staleTime: staleTime,
  });
};

export const useCancelMatchup = async () => {
  return await queryClient.cancelQueries({ queryKey: [queryKey] });
};
