import { type PropsWithChildren } from 'react';

import { createStoreContext } from '@/stores/createStoreContext';

export type DifficultyMode = 'simple' | 'expert';

export type DifficultyStore = {
  mode: DifficultyMode;
  actions: {
    setMode: (mode: DifficultyMode) => void;
  };
};

type DifficultyStoreProps = { initialMode?: DifficultyMode };
export type DifficultyStoreProviderProps = PropsWithChildren<DifficultyStoreProps>;

const { Provider, useStoreSelector } = createStoreContext<DifficultyStore, DifficultyStoreProps>(
  'Difficulty',
  ({ initialMode = 'simple' }) =>
    (set) => ({
      mode: initialMode,
      actions: {
        setMode: (mode) => set({ mode }),
      },
    })
);

export const DifficultyStoreProvider = Provider;
export const useDifficultyMode = () => useStoreSelector((state) => state.mode);
export const useDifficultyActions = () => useStoreSelector((state) => state.actions);
