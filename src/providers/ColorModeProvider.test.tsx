import { act, renderHook } from '@testing-library/react';
import React, { ReactNode } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';

import { ColorModeProvider, useColorMode, useColorModeValue } from '@/providers';

const wrapper = ({ children }: { children: ReactNode }) => (
  <ColorModeProvider attribute="class" defaultTheme="light" enableSystem={false}>
    {children}
  </ColorModeProvider>
);

// jsdom disables the real localStorage without an http(s) origin configured
// (this project's jsdom environment has none), so next-themes' own reads/
// writes silently no-op here. That masks the actual behavior we need to
// test: next-themes persists the chosen theme to localStorage and reads it
// back on mount ahead of defaultTheme, so a leftover value from a previous
// test would otherwise override this test's starting point. Stubbing a real
// in-memory Storage makes the tests exercise that persistence for real,
// consistently across every environment, and lets a fresh instance per test
// guarantee isolation.
class MemoryStorage implements Storage {
  private store = new Map<string, string>();
  get length() {
    return this.store.size;
  }
  clear() {
    this.store.clear();
  }
  getItem(key: string) {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  key(index: number) {
    return Array.from(this.store.keys())[index] ?? null;
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
  setItem(key: string, value: string) {
    this.store.set(key, String(value));
  }
}

describe('ColorModeProvider', () => {
  beforeEach(() => {
    // A plain property assignment (not vi.stubGlobal, which vitest.setup.ts
    // already uses for matchMedia): vi.unstubAllGlobals() in an afterEach
    // here would revert every stub made via that API, including the
    // matchMedia one set up once for the whole suite.
    Object.defineProperty(window, 'localStorage', {
      value: new MemoryStorage(),
      writable: true,
      configurable: true,
    });
  });


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
