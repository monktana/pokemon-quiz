import React from 'react';
import { ThemeProvider, useTheme } from 'next-themes';
import type { ThemeProviderProps } from 'next-themes';

export function ColorModeProvider(props: ThemeProviderProps) {
  return <ThemeProvider attribute="class" disableTransitionOnChange {...props} />;
}

export type ColorMode = 'light' | 'dark';

export function useColorMode() {
  const { resolvedTheme, setTheme } = useTheme();
  const colorMode = resolvedTheme as ColorMode;

  const toggleColorMode = () => {
    setTheme(colorMode === 'dark' ? 'light' : 'dark');
  };

  return { colorMode, setColorMode: setTheme, toggleColorMode };
}

export function useColorModeValue<T>(light: T, dark: T) {
  const { colorMode } = useColorMode();
  return colorMode === 'dark' ? dark : light;
}
