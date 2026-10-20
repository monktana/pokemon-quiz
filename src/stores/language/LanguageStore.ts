import { type PropsWithChildren } from 'react';

import { createStoreContext } from '@/stores/createStoreContext';
import { getAppLanguage, type Language } from '@/util';

export type LanguageStore = {
  language: Language;
  actions: {
    setLanguage: (language: Language) => void;
  };
};

type LanguageStoreProps = { initialLanguage: string };
export type LanguageStoreProviderProps = PropsWithChildren<LanguageStoreProps>;

const { Provider, useStoreSelector } = createStoreContext<LanguageStore, LanguageStoreProps>(
  'Language',
  ({ initialLanguage }) =>
    (set) => ({
      language: getAppLanguage(initialLanguage),
      actions: {
        setLanguage: (language) => {
          document.documentElement.lang = language;
          set({ language });
        },
      },
    })
);

export const LanguageStoreProvider = Provider;
export const useLanguage = () => useStoreSelector((state) => state.language);
export const useLanguageActions = () => useStoreSelector((state) => state.actions);
