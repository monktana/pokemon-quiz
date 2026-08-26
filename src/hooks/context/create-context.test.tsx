import { renderHook } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { createContext } from '@/hooks';

describe('createContext', () => {
  it('returns the provided value inside the provider', () => {
    const [Provider, useCtx] = createContext<number>();

    const { result } = renderHook(() => useCtx(), {
      wrapper: ({ children }) => <Provider value={42}>{children}</Provider>,
    });

    expect(result.current).toBe(42);
  });

  it('throws a default error when used outside its provider in strict mode', () => {
    expect.assertions(1);
    const [, useCtx] = createContext<number>({
      hookName: 'useCtx',
      providerName: 'CtxProvider',
    });

    renderHook(() => {
      try {
        useCtx();
      } catch (error) {
        expect((error as Error).message).toEqual(
          'useCtx returned `undefined`. Seems you forgot to wrap component within CtxProvider'
        );
      }
    });
  });

  it('throws a custom error message when provided', () => {
    expect.assertions(1);
    const [, useCtx] = createContext<number>({ errorMessage: 'custom missing context message' });

    renderHook(() => {
      try {
        useCtx();
      } catch (error) {
        expect((error as Error).message).toEqual('custom missing context message');
      }
    });
  });

  it('returns undefined outside its provider when strict mode is disabled', () => {
    const [, useCtx] = createContext<number>({ strict: false });

    const { result } = renderHook(() => useCtx());

    expect(result.current).toBeUndefined();
  });
});
