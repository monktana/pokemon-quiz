import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { Pokemon } from '@/api/schema';
import { TypeEffectiveness } from '@/api/schema';
import * as roundChance from '@/lib/roundChance';

import { useRoundLifecycle } from './useRoundLifecycle';

const { preloadImageMock } = vi.hoisted(() => ({ preloadImageMock: vi.fn() }));
vi.mock('@/lib', async () => {
  const actual = await vi.importActual<typeof import('@/lib')>('@/lib');
  return { ...actual, preloadImage: preloadImageMock };
});

const makePokemon = (id: number): Pokemon => ({
  id,
  name: `fakemon-${id}`,
  sprites: { back_default: `sprite-${id}.png` },
});

const CORRECT = TypeEffectiveness.SuperEffective;
const WRONG = TypeEffectiveness.Effective;

describe('useRoundLifecycle', () => {
  it('starts at round 1, answering, with the first team member active', () => {
    const team = [makePokemon(1), makePokemon(2)];
    const { result } = renderHook(() => useRoundLifecycle(team));

    expect(result.current.round).toBe(1);
    expect(result.current.activeId).toBe(1);
    expect(result.current.koIds).toEqual([]);
    expect(result.current.outcome).toEqual({ kind: 'answering' });
    expect(result.current.feedback).toBeNull();
  });

  it('reports correctness synchronously from submitGuess', () => {
    const team = [makePokemon(1), makePokemon(2)];
    const switchSpy = vi.spyOn(roundChance, 'shouldSwitchAttacker').mockReturnValue(false);
    const { result } = renderHook(() => useRoundLifecycle(team));

    let outcome: { correct: boolean } | undefined;
    act(() => {
      outcome = result.current.submitGuess(CORRECT, CORRECT);
    });
    expect(outcome).toEqual({ correct: true });

    switchSpy.mockRestore();
  });

  it('advances to the next round on a correct guess with no switch', async () => {
    // No child ever suspends in this bare hook test, so there's no real
    // async work for the internal startTransition to defer against - the
    // 'advancing' outcome (real and observable in Battle, where the next
    // round's matchup fetch gives the transition something to wait on)
    // settles to 'answering' within the same act() here. Only the settled
    // end state is a stable contract to assert on in isolation.
    const team = [makePokemon(1), makePokemon(2)];
    const switchSpy = vi.spyOn(roundChance, 'shouldSwitchAttacker').mockReturnValue(false);
    const { result } = renderHook(() => useRoundLifecycle(team));

    act(() => {
      result.current.submitGuess(CORRECT, CORRECT);
    });

    await waitFor(() => expect(result.current.round).toBe(2));
    expect(result.current.outcome).toEqual({ kind: 'answering' });
    expect(result.current.activeId).toBe(1);

    switchSpy.mockRestore();
  });

  it(
    'switches to a random teammate and advances the round when the switch chance hits',
    async () => {
      const team = [makePokemon(1), makePokemon(2)];
      const switchSpy = vi.spyOn(roundChance, 'shouldSwitchAttacker').mockReturnValue(true);
      const { result } = renderHook(() => useRoundLifecycle(team));

      act(() => {
        result.current.submitGuess(CORRECT, CORRECT);
      });

      expect(result.current.outcome).toEqual({ kind: 'switching', incomingId: 2 });
      // Doesn't apply the switch immediately - only once the message
      // duration has played out, in the same transition as the round
      // increment.
      expect(result.current.activeId).toBe(1);
      expect(result.current.round).toBe(1);

      await waitFor(() => expect(result.current.round).toBe(2), { timeout: 3000 });
      expect(result.current.activeId).toBe(2);
      expect(result.current.outcome).toEqual({ kind: 'answering' });
      expect(result.current.feedback).toBeNull();

      switchSpy.mockRestore();
    },
    8000
  );

  it(
    'faints the active member and switches to a remaining one on a wrong guess',
    async () => {
      const team = [makePokemon(1), makePokemon(2)];
      const { result } = renderHook(() => useRoundLifecycle(team));

      act(() => {
        result.current.submitGuess(WRONG, CORRECT);
      });

      expect(result.current.outcome).toEqual({ kind: 'fainted', attackerId: 1 });
      expect(result.current.feedback).toEqual({ guess: WRONG, correct: false });
      expect(result.current.koIds).toEqual([]);

      await waitFor(() => expect(result.current.round).toBe(2), { timeout: 3000 });
      expect(result.current.koIds).toEqual([1]);
      expect(result.current.activeId).toBe(2);
      expect(result.current.outcome).toEqual({ kind: 'answering' });
      expect(result.current.feedback).toBeNull();
    },
    8000
  );

  it(
    "reports 'ending' once the last team member has fainted, and does not advance further",
    async () => {
      const team = [makePokemon(1)];
      const { result } = renderHook(() => useRoundLifecycle(team));

      act(() => {
        result.current.submitGuess(WRONG, CORRECT);
      });

      expect(result.current.outcome).toEqual({ kind: 'fainted', attackerId: 1 });

      await waitFor(() => expect(result.current.outcome).toEqual({ kind: 'ending' }), {
        timeout: 3000,
      });
      expect(result.current.koIds).toEqual([1]);
      expect(result.current.round).toBe(1);
    },
    8000
  );
});
