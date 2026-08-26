import { act, renderHook } from '@testing-library/react';
import React, { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { ColorModeProvider, useColorMode, useColorModeValue } from '@/providers';

const wrapper = ({ children }: { children: ReactNode }) => (
  <ColorModeProvider attribute="class" defaultTheme="light" enableSystem={false}>
    {children}
  </ColorModeProvider>
);

describe('ColorModeProvider', () => {
  it('exposes the resolved color mode', () => {
    const { result } = renderHook(() => useColorMode(), { wrapper });

    expect(result.current.colorMode).toEqual('light');
  });

  it('toggles from light to dark', () => {
    const { result, rerender } = renderHook(() => useColorMode(), { wrapper });

    act(result.current.toggleColorMode);
    rerender();

    expect(result.current.colorMode).toEqual('dark');
  });

  it('toggles from dark back to light', () => {
    const { result, rerender } = renderHook(() => useColorMode(), { wrapper });

    act(result.current.toggleColorMode);
    rerender();
    expect(result.current.colorMode).toEqual('dark');

    act(result.current.toggleColorMode);
    rerender();
    expect(result.current.colorMode).toEqual('light');
  });

  it('resolves a value pair based on the current color mode', () => {
    const { result, rerender } = renderHook(
      () => ({
        colorMode: useColorMode(),
        value: useColorModeValue('light-value', 'dark-value'),
      }),
      { wrapper }
    );

    expect(result.current.value).toEqual('light-value');

    act(result.current.colorMode.toggleColorMode);
    rerender();

    expect(result.current.value).toEqual('dark-value');
  });
});
