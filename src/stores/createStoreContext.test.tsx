import React, { type ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { createStoreContext } from './createStoreContext';

type CounterStore = {
  count: number;
  actions: { increase: () => void };
};

const { Provider, useStoreSelector } = createStoreContext<
  CounterStore,
  { initialCount: number }
>('Counter', ({ initialCount }) => (set) => ({
  count: initialCount,
  actions: {
    increase: () => set((state) => ({ count: state.count + 1 })),
  },
}));

const useCount = () => useStoreSelector((state) => state.count);
const useCounterActions = () => useStoreSelector((state) => state.actions);

const createWrapper = (initialCount: number) => {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <Provider initialCount={initialCount}>{children}</Provider>;
  };
};

describe('createStoreContext', () => {
  it('threads Provider props into the initial state', () => {
    const { result } = renderHook(() => useCount(), { wrapper: createWrapper(5) });

    expect(result.current).toBe(5);
  });

  it('lets a selector read updates made through an action', () => {
    const { result, rerender } = renderHook(
      () => ({ count: useCount(), actions: useCounterActions() }),
      { wrapper: createWrapper(0) }
    );

    act(result.current.actions.increase);
    rerender();

    expect(result.current.count).toBe(1);
  });

  it('gives each Provider instance its own isolated store', () => {
    const { result: first } = renderHook(
      () => ({ count: useCount(), actions: useCounterActions() }),
      { wrapper: createWrapper(0) }
    );
    const { result: second } = renderHook(() => useCount(), { wrapper: createWrapper(10) });

    act(first.current.actions.increase);

    expect(first.current.count).toBe(1);
    expect(second.current).toBe(10);
  });

  it('throws a "Missing <name>Provider" error when used outside its Provider', () => {
    expect(() => renderHook(() => useCount())).toThrow('Missing CounterProvider');
  });
});
