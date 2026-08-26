import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React, { ReactNode, Suspense } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useCancelMatchup, useMatchup, usePrefetchMatchup } from '@/api/queries/getMatchup';
import { Matchup, TypeEffectiveness } from '@/api/schema';
import { queryClient } from '@/lib';
import { bulbasaur } from '@/lib/testing/fixtures';

const { generateMatchupMock, preloadImageMock } = vi.hoisted(() => ({
  generateMatchupMock: vi.fn(),
  preloadImageMock: vi.fn(),
}));

vi.mock('@/lib/generateMatchup', () => ({
  generateMatchup: generateMatchupMock,
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
});

describe('useMatchup', () => {
  it('resolves the generated matchup for the given round and attacker', async () => {
    const { result } = renderHook(() => useMatchup(1, bulbasaur.id!), { wrapper });

    await waitFor(() => expect(result.current.data).toBeDefined());

    expect(result.current.data).toEqual(fixtureMatchup);
    expect(generateMatchupMock).toHaveBeenCalledWith(bulbasaur.id);
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
