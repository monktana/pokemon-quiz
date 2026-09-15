import React, { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ScoreStoreProvider, ScoreStoreProviderProps, useScore, useScoreActions } from '@/stores';

describe('ScoreStore', () => {
  it('provides a hook to access the current score', () => {
    const { result } = renderHook(() => useScore(), {
      wrapper: createWrapper(ScoreStoreProvider, { initialScore: 1 }),
    });

    expect(result.current).toEqual(1);
  });

  it('provides a method to increase the score', () => {
    const wrapper = createWrapper(ScoreStoreProvider, { initialScore: 0 });

    const { result, rerender } = renderHook(
      () => ({
        score: useScore(),
        actions: useScoreActions(),
      }),
      {
        wrapper,
      }
    );

    act(result.current.actions.increase);
    rerender();

    expect(result.current.score).toEqual(1);
  });

  it('provides a method to decrease the score', () => {
    const wrapper = createWrapper(ScoreStoreProvider, { initialScore: 2 });

    const { result, rerender } = renderHook(
      () => ({
        score: useScore(),
        actions: useScoreActions(),
      }),
      {
        wrapper,
      }
    );

    act(result.current.actions.decrease);
    rerender();

    expect(result.current.score).toEqual(1);
  });

  it('provides a method to reset the score', () => {
    const wrapper = createWrapper(ScoreStoreProvider, { initialScore: 5 });

    const { result, rerender } = renderHook(
      () => ({
        score: useScore(),
        actions: useScoreActions(),
      }),
      {
        wrapper,
      }
    );

    act(result.current.actions.reset);
    rerender();

    expect(result.current.score).toEqual(0);
  });

  it('resets a negative score', () => {
    const wrapper = createWrapper(ScoreStoreProvider, { initialScore: -5 });

    const { result, rerender } = renderHook(
      () => ({
        score: useScore(),
        actions: useScoreActions(),
      }),
      {
        wrapper,
      }
    );

    act(result.current.actions.reset);
    rerender();

    expect(result.current.score).toEqual(0);
  });

  it('resets the score after multiple actions', () => {
    const wrapper = createWrapper(ScoreStoreProvider, { initialScore: 5 });

    const { result, rerender } = renderHook(
      () => ({
        score: useScore(),
        actions: useScoreActions(),
      }),
      {
        wrapper,
      }
    );

    act(result.current.actions.increase);
    act(result.current.actions.increase);
    act(result.current.actions.decrease);
    rerender();

    expect(result.current.score).toEqual(6);

    act(result.current.actions.reset);
    rerender();

    expect(result.current.score).toEqual(0);
  });

});

const createWrapper = (
  Wrapper: (props: ScoreStoreProviderProps) => React.JSX.Element,
  props: ScoreStoreProviderProps
) => {
  return function CreatedWrapper({ children }: { children: ReactNode }) {
    return <Wrapper {...props}>{children}</Wrapper>;
  };
};
