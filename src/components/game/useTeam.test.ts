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

  it('decides on a switch candidate without mutating activeId, when the chance hits', () => {
    const team = [makePokemon(1), makePokemon(2), makePokemon(3)];
    const { result, rerender } = renderHook(() => useTeam(team));

    // Below the switch chance threshold, and picks the first eligible id via
    // randomItem's Math.floor(0 * length) = 0.
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);
    let candidateId: number | null = null;
    act(() => {
      candidateId = result.current.maybeSwitchActive();
    });
    rerender();
    randomSpy.mockRestore();

    expect(candidateId).not.toBeNull();
    expect(candidateId).not.toBe(1);
    // A pure decision: activeId only changes once switchActiveTo is called.
    expect(result.current.activeId).toBe(1);
    expect(result.current.koIds).toEqual([]);
  });

  it('applies a switch candidate via switchActiveTo without touching koIds', () => {
    const team = [makePokemon(1), makePokemon(2)];
    const { result, rerender } = renderHook(() => useTeam(team));

    act(() => {
      result.current.switchActiveTo(2);
    });
    rerender();

    expect(result.current.activeId).toBe(2);
    expect(result.current.koIds).toEqual([]);
  });

  it('does not switch when the random roll misses the switch chance', () => {
    const team = [makePokemon(1), makePokemon(2)];
    const { result, rerender } = renderHook(() => useTeam(team));

    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.99);
    let nextActiveId: number | null = null;
    act(() => {
      nextActiveId = result.current.maybeSwitchActive();
    });
    rerender();
    randomSpy.mockRestore();

    expect(nextActiveId).toBeNull();
    expect(result.current.activeId).toBe(1);
  });

  it('does not switch when no other non-fainted teammate is available', () => {
    const team = [makePokemon(1)];
    const { result, rerender } = renderHook(() => useTeam(team));

    // Would trigger the switch chance, but there's nowhere else to switch to.
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);
    let nextActiveId: number | null = null;
    act(() => {
      nextActiveId = result.current.maybeSwitchActive();
    });
    rerender();
    randomSpy.mockRestore();

    expect(nextActiveId).toBeNull();
    expect(result.current.activeId).toBe(1);
  });
});
