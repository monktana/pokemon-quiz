import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React, { ReactNode, Suspense } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useCancelMatchup, useMatchup, usePrefetchMatchup } from '@/api/queries/getMatchup';
import { Matchup, TypeEffectiveness } from '@/api/schema';
import { queryClient } from '@/lib';
import { bulbasaur } from '@/lib/testing/fixtures';

const { generateMatchupMock, preloadImageMock, resetMatchupHistoryMock, recordMatchupHistoryMock } =
  vi.hoisted(() => ({
    generateMatchupMock: vi.fn(),
    preloadImageMock: vi.fn(),
    resetMatchupHistoryMock: vi.fn(),
    recordMatchupHistoryMock: vi.fn(),
  }));

vi.mock('@/lib/generateMatchup', () => ({
  generateMatchup: generateMatchupMock,
}));

vi.mock('@/lib/matchupHistory', () => ({
  resetMatchupHistory: resetMatchupHistoryMock,
  recordMatchupHistory: recordMatchupHistoryMock,
}));

vi.mock('@/lib', async () => {
  const actual = await vi.importActual<typeof import('@/lib')>('@/lib');
  return { ...actual, preloadImage: preloadImageMock };
});

const defenderWithSprite: Matchup['defender'] = {
  ...bulbasaur,
  id: 2,
  sprites: { front_default: 'https://example.test/defender.png' },
};

const fixtureMatchup: Matchup = {
  attacker: bulbasaur,
  defender: defenderWithSprite,
  move: bulbasaur.moves![0],
  effectiveness: TypeEffectiveness.Effective,
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <Suspense fallback={null}>{children}</Suspense>
  </QueryClientProvider>
);

beforeEach(() => {
  generateMatchupMock.mockResolvedValue(fixtureMatchup);
});

afterEach(async () => {
  await queryClient.cancelQueries();
  queryClient.clear();
  generateMatchupMock.mockReset();
  preloadImageMock.mockClear();
  resetMatchupHistoryMock.mockClear();
  recordMatchupHistoryMock.mockClear();
});

describe('useMatchup', () => {
  it('resolves the generated matchup for the given round and attacker', async () => {
    const { result } = renderHook(() => useMatchup(1, bulbasaur.id!), { wrapper });

    await waitFor(() => expect(result.current.data).toBeDefined());

    expect(result.current.data).toEqual(fixtureMatchup);
    expect(generateMatchupMock).toHaveBeenCalledWith(bulbasaur.id);
  });

  it('does not reset matchup history again for a later round in the same hook instance', async () => {
    // Suspense discards a render attempt's hook state entirely if it
    // doesn't commit, so the reset guard can legitimately fire more than
    // once while round 1's *first* fetch is settling (harmless - nothing
    // ever records in between, see the comment in getMatchup.ts). The
    // invariant that actually matters, and the only one asserted here, is
    // that it never fires again once a round has genuinely committed.
    const { result, rerender } = renderHook(({ round }) => useMatchup(round, bulbasaur.id!), {
      wrapper,
      initialProps: { round: 1 },
    });
    await waitFor(() => expect(result.current.data).toBeDefined());
    const callsAfterRoundOneSettled = resetMatchupHistoryMock.mock.calls.length;
    expect(callsAfterRoundOneSettled).toBeGreaterThan(0);

    rerender({ round: 2 });
    await waitFor(() => expect(result.current.data).toBeDefined());

    expect(resetMatchupHistoryMock).toHaveBeenCalledTimes(callsAfterRoundOneSettled);
  });

  it('records history only for a matchup that resolves through this hook, not a discarded prefetch', async () => {
    // Populates the cache for a key nothing ever renders useMatchup for -
    // exactly what a discarded prefetch (e.g. for the Pokemon active before
    // a switch/faint) looks like.
    await usePrefetchMatchup(5, bulbasaur.id!);
    expect(recordMatchupHistoryMock).not.toHaveBeenCalled();

    const { result } = renderHook(() => useMatchup(6, bulbasaur.id!), { wrapper });
    await waitFor(() => expect(result.current.data).toBeDefined());

    expect(recordMatchupHistoryMock).toHaveBeenCalledTimes(1);
    expect(recordMatchupHistoryMock).toHaveBeenCalledWith(
      fixtureMatchup.move!.type!.id,
      fixtureMatchup.effectiveness
    );
  });
});

describe('usePrefetchMatchup', () => {
  it('populates the cache and preloads the defender sprite', async () => {
    await usePrefetchMatchup(2, bulbasaur.id!);

    expect(queryClient.getQueryData(['matchup', 2, bulbasaur.id])).toEqual(fixtureMatchup);
    expect(preloadImageMock).toHaveBeenCalledWith(defenderWithSprite.sprites!.front_default);
  });

  it('does not preload when the defender has no sprite', async () => {
    generateMatchupMock.mockResolvedValueOnce({
      ...fixtureMatchup,
      defender: { ...defenderWithSprite, sprites: {} },
    });

    await usePrefetchMatchup(3, bulbasaur.id!);

    expect(preloadImageMock).not.toHaveBeenCalled();
  });
});

describe('useCancelMatchup', () => {
  it('cancels in-flight matchup queries', async () => {
    const cancelSpy = vi.spyOn(queryClient, 'cancelQueries');

    await useCancelMatchup();

    expect(cancelSpy).toHaveBeenCalledWith({ queryKey: ['matchup'] });

    cancelSpy.mockRestore();
  });
});
