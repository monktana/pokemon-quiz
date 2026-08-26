import { useCallback, useEffect, useState } from 'react';

import type { Pokemon } from '@/api/schema';
import { preloadImage } from '@/lib';
import { randomItem } from '@/lib/generateMatchup';

export const useTeam = (team: Pokemon[]) => {
  const [koIds, setKoIds] = useState<number[]>([]);
  // `team` is already randomly assembled/ordered by generateTeam, so treating
  // the first slot as the starting attacker is still a random pick, while
  // staying a deterministic function of the (already resolved) team prop.
  const [activeId, setActiveId] = useState<number>(() => team[0].id!);

  // Every team member becomes the attacker eventually, and its back sprite
  // never changes, so warming all 6 upfront means fainting into the next
  // one is never blocked on a fresh network fetch.
  useEffect(() => {
    team.forEach((pokemon) => {
      const src = pokemon.sprites?.back_default;
      if (src) preloadImage(src);
    });
  }, [team]);

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
