import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React, { ReactNode, Suspense } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useResetTeam, useTeamQuery } from '@/api/queries/getTeam';
import { queryClient } from '@/lib';
import { bulbasaur } from '@/lib/testing/fixtures';

const fixtureTeam = [bulbasaur];

vi.mock('@/lib/generateTeam', () => ({
  generateTeam: vi.fn(() => Promise.resolve(fixtureTeam)),
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <Suspense fallback={null}>{children}</Suspense>
  </QueryClientProvider>
);

afterEach(async () => {
  await queryClient.cancelQueries();
  queryClient.clear();
});

describe('useTeamQuery', () => {
  it('resolves the generated team', async () => {
    const { result } = renderHook(() => useTeamQuery(), { wrapper });

    await waitFor(() => expect(result.current.data).toBeDefined());

    expect(result.current.data).toEqual(fixtureTeam);
  });
});

describe('useResetTeam', () => {
  it('removes the cached team query', async () => {
    const { result } = renderHook(() => useTeamQuery(), { wrapper });
    await waitFor(() => expect(result.current.data).toBeDefined());

    expect(queryClient.getQueryData(['team'])).toEqual(fixtureTeam);

    await useResetTeam();

    expect(queryClient.getQueryData(['team'])).toBeUndefined();
  });
});
