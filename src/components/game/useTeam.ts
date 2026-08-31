import { useCallback, useEffect, useState } from 'react';

import type { Pokemon } from '@/api/schema';
import { preloadImage } from '@/lib';
import { randomItem } from '@/lib/generateMatchup';

// Kept fairly high: a switch is a lightweight, non-punishing transition (no
// fainting involved), so it can afford to show up more often than the STAB
// question chance without disrupting the core guessing loop.
const ATTACKER_SWITCH_CHANCE = 0.4;

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

  // Occasionally rotates the active Pokemon out even on a correct guess, so
  // a long win streak doesn't get stuck quizzing the same attacker - and by
  // extension, largely the same move types - round after round. Pure
  // decision, no state mutation: returns who *would* become active, or null
  // if no switch happens (chance missed, or no other non-fainted team
  // member exists to switch to). Split from applying it (see
  // `switchActiveTo` below) because the caller needs to know the incoming
  // id/name to show a transition message before the round actually
  // advances - `activeId` itself must only change together with the round
  // increment, inside the same transition, or it suspends immediately on
  // its own instead of waiting with the rest of the round's new data.
  const maybeSwitchActive = useCallback(() => {
    if (Math.random() >= ATTACKER_SWITCH_CHANCE) {
      return null;
    }

    const eligible = team
      .map((pokemon) => pokemon.id!)
      .filter((id) => id !== activeId && !koIds.includes(id));

    if (eligible.length === 0) {
      return null;
    }

    return randomItem(eligible);
  }, [activeId, koIds, team]);

  const switchActiveTo = useCallback((id: number) => {
    setActiveId(id);
  }, []);

  return { activeId, koIds, faintActive, maybeSwitchActive, switchActiveTo };
};
