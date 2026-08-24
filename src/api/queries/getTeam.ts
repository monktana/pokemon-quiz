import { useSuspenseQuery } from '@tanstack/react-query';

import { Pokemon } from '@/api';
import { queryClient } from '@/lib';
import { generateTeam } from '@/lib/generateTeam';

const queryKey = ['team'];

const getTeam = async (): Promise<Pokemon[]> => generateTeam();

export const useTeamQuery = () => {
  return useSuspenseQuery({
    queryKey,
    queryFn: getTeam,
    staleTime: Infinity
  });
};

export const useResetTeam = async () => {
  return await queryClient.removeQueries({ queryKey });
};
