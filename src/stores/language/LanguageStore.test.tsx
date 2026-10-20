import React, { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  LanguageStoreProvider,
  LanguageStoreProviderProps,
  useLanguage,
  useLanguageActions,
} from '@/stores';

describe('LanguageStore', () => {
  it('provides a hook to access the current language', () => {
    const { result } = renderHook(() => useLanguage(), {
      wrapper: createWrapper(LanguageStoreProvider, { initialLanguage: 'en' }),
    });

    expect(result.current, 'en');
  });

  it('provides a hook with a method to set the language', () => {
    const wrapper = createWrapper(LanguageStoreProvider, { initialLanguage: 'en' });

    const { result, rerender } = renderHook(
      () => ({
        language: useLanguage(),
        actions: useLanguageActions(),
      }),
      {
        wrapper,
      }
    );

    act(() => result.current.actions.setLanguage('de'));
    rerender();

    expect(result.current.language, 'de');
  });

});

const createWrapper = (
  Wrapper: ({ children, initialLanguage }: LanguageStoreProviderProps) => React.JSX.Element,
  props: LanguageStoreProviderProps
) => {
  return function CreatedWrapper({ children }: { children: ReactNode }) {
    return <Wrapper {...props}>{children}</Wrapper>;
  };
};
