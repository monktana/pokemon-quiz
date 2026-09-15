import React, { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  DifficultyStoreProvider,
  DifficultyStoreProviderProps,
  useDifficultyActions,
  useDifficultyMode,
} from '@/stores';

describe('DifficultyStore', () => {
  it('defaults to simple mode', () => {
    const { result } = renderHook(() => ({ mode: useDifficultyMode() }), {
      wrapper: createWrapper(DifficultyStoreProvider, {}),
    });

    expect(result.current.mode).toBe('simple');
  });

  it('provides a hook with a method to change mode', () => {
    const wrapper = createWrapper(DifficultyStoreProvider, {});

    const { result, rerender } = renderHook(
      () => ({
        mode: useDifficultyMode(),
        actions: useDifficultyActions(),
      }),
      { wrapper }
    );

    act(() => result.current.actions.setMode('expert'));
    rerender();

    expect(result.current.mode).toBe('expert');
  });

});

const createWrapper = (
  Wrapper: ({ children }: DifficultyStoreProviderProps) => React.JSX.Element,
  props: DifficultyStoreProviderProps
) => {
  return function CreatedWrapper({ children }: { children: ReactNode }) {
    return <Wrapper {...props}>{children}</Wrapper>;
  };
};
