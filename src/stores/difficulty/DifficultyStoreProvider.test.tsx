import React, { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  DifficultyStoreProvider,
  DifficultyStoreProviderProps,
  useDifficultyActions,
  useDifficultyMode,
  useIncludeStab,
} from '@/stores';

describe('DifficultyStoreProvider', () => {
  it('defaults to simple mode and STAB questions disabled', () => {
    const { result } = renderHook(
      () => ({ mode: useDifficultyMode(), includeStab: useIncludeStab() }),
      { wrapper: createWrapper(DifficultyStoreProvider, {}) }
    );

    expect(result.current.mode).toBe('simple');
    expect(result.current.includeStab).toBe(false);
  });

  it('provides a hook with methods to change mode and STAB questions', () => {
    const wrapper = createWrapper(DifficultyStoreProvider, {});

    const { result, rerender } = renderHook(
      () => ({
        mode: useDifficultyMode(),
        includeStab: useIncludeStab(),
        actions: useDifficultyActions(),
      }),
      { wrapper }
    );

    act(() => result.current.actions.setMode('expert'));
    act(() => result.current.actions.setIncludeStab(true));
    rerender();

    expect(result.current.mode).toBe('expert');
    expect(result.current.includeStab).toBe(true);
  });

  it('causes the provided hooks to throw if provider is absent', () => {
    renderHook(() => {
      try {
        useDifficultyMode();
      } catch (error) {
        expect((error as Error).message).toEqual('Missing DifficultyStoreProvider');
      }
    });
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
