import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { useAppState, useAppStateActions } from '@/stores';

// appState is a module-level singleton (unlike Score/Language, it has no
// Provider), so tests must restore it or later specs would inherit
// whatever state the previous one left behind.
afterEach(() => {
  const { result } = renderHook(() => useAppStateActions());
  act(result.current.openMenu);
});

describe('appState store', () => {
  it('starts in the menu state', () => {
    const { result } = renderHook(() => useAppState());
    expect(result.current).toEqual('menu');
  });

  it('transitions to the quiz state on startQuiz', () => {
    const { result, rerender } = renderHook(() => ({
      appState: useAppState(),
      actions: useAppStateActions(),
    }));

    act(result.current.actions.startQuiz);
    rerender();

    expect(result.current.appState).toEqual('quiz');
  });

  it('transitions to the gameover state on endQuiz', () => {
    const { result, rerender } = renderHook(() => ({
      appState: useAppState(),
      actions: useAppStateActions(),
    }));

    act(result.current.actions.endQuiz);
    rerender();

    expect(result.current.appState).toEqual('gameover');
  });

  it('transitions back to the menu state on openMenu', () => {
    const { result, rerender } = renderHook(() => ({
      appState: useAppState(),
      actions: useAppStateActions(),
    }));

    act(result.current.actions.endQuiz);
    rerender();
    act(result.current.actions.openMenu);
    rerender();

    expect(result.current.appState).toEqual('menu');
  });
});
