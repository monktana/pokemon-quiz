import { useSuspenseQuery } from '@tanstack/react-query';

import { Matchup } from '@/api';
import { queryClient } from '@/lib';
import { generateMatchup } from '@/lib/generateMatchup';

const queryKey = 'matchup';
const staleTime = 10 * 1000;

const getMatchup = async (): Promise<Matchup> => generateMatchup();

export const useMatchup = (id: number) => {
  return useSuspenseQuery({
    queryKey: [queryKey, id],
    queryFn: getMatchup,
    staleTime: staleTime
  });
};

export const usePrefetchMatchup = async (id: number) => {
  return await queryClient.prefetchQuery({
    queryKey: [queryKey, id],
    queryFn: getMatchup,
    staleTime: staleTime
  });
};

export const useCancelMatchup = async () => {
  return await queryClient.cancelQueries({ queryKey: [queryKey] });
};

export const useInvalidateMatchup = async (id: number) => {
  return await queryClient.invalidateQueries({ queryKey: [queryKey, id] });
};
