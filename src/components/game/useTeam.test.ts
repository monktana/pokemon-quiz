import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { Pokemon } from '@/api/schema';
import { useTeam } from '@/components/game/useTeam';

const { preloadImageMock } = vi.hoisted(() => ({ preloadImageMock: vi.fn() }));
vi.mock('@/lib', async () => {
  const actual = await vi.importActual<typeof import('@/lib')>('@/lib');
  return { ...actual, preloadImage: preloadImageMock };
});

const makePokemon = (id: number, backSprite: string | null = `sprite-${id}.png`): Pokemon => ({
  id,
  name: `fakemon-${id}`,
  sprites: { back_default: backSprite },
});

describe('useTeam', () => {
  it('starts with the first team member active and no faints', () => {
    const team = [makePokemon(1), makePokemon(2), makePokemon(3)];
    const { result } = renderHook(() => useTeam(team));

    expect(result.current.activeId).toBe(1);
    expect(result.current.koIds).toEqual([]);
  });

  it('preloads every team member back sprite on mount', () => {
    preloadImageMock.mockClear();
    const team = [makePokemon(1), makePokemon(2, null)];
    renderHook(() => useTeam(team));

    expect(preloadImageMock).toHaveBeenCalledWith('sprite-1.png');
    expect(preloadImageMock).toHaveBeenCalledTimes(1);
  });

  it('faints the active member, adds it to koIds, and switches to a remaining member', () => {
    const team = [makePokemon(1), makePokemon(2)];
    const { result, rerender } = renderHook(() => useTeam(team));

    let nextActiveId: number | null = null;
    act(() => {
      nextActiveId = result.current.faintActive();
    });
    rerender();

    expect(result.current.koIds).toEqual([1]);
    expect(nextActiveId).toBe(2);
    expect(result.current.activeId).toBe(2);
  });

  it('returns null once the last team member has fainted', () => {
    const team = [makePokemon(1)];
    const { result, rerender } = renderHook(() => useTeam(team));

    let nextActiveId: number | null = null;
    act(() => {
      nextActiveId = result.current.faintActive();
    });
    rerender();

    expect(result.current.koIds).toEqual([1]);
    expect(nextActiveId).toBeNull();
  });
});
