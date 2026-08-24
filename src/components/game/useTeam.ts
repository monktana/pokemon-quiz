import { useCallback, useState } from 'react';

import type { Pokemon } from '@/api/schema';

const randomItem = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

export const useTeam = (team: Pokemon[]) => {
  const [koIds, setKoIds] = useState<number[]>([]);
  // `team` is already randomly assembled/ordered by generateTeam, so treating
  // the first slot as the starting attacker is still a random pick, while
  // staying a deterministic function of the (already resolved) team prop.
  const [activeId, setActiveId] = useState<number>(() => team[0].id!);

  const faintActive = useCallback(() => {
    const nextKoIds = [...koIds, activeId];
    const remaining = team.map((pokemon) => pokemon.id!).filter((id) => !nextKoIds.includes(id));

    setKoIds(nextKoIds);

    if (remaining.length === 0) {
      return null;
    }

    const nextActiveId = randomItem(remaining);
    setActiveId(nextActiveId);
    return nextActiveId;
  }, [koIds, activeId, team]);

  return { activeId, koIds, faintActive };
};
