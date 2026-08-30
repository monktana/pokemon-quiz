import React, { PropsWithChildren } from 'react';
import { createStore, StoreApi } from 'zustand';

import { DifficultyMode, DifficultyStore } from '@/stores';

export type DifficultyStoreProviderProps = PropsWithChildren<{
  initialMode?: DifficultyMode;
}>;

export const DifficultyStoreContext = React.createContext<StoreApi<DifficultyStore> | null>(null);

export const DifficultyStoreProvider = ({
  children,
  initialMode = 'simple',
}: DifficultyStoreProviderProps) => {
  const [store] = React.useState(() =>
    createStore<DifficultyStore>()((set) => ({
      mode: initialMode,
      includeStab: false,
      actions: {
        setMode: (mode) => set({ mode }),
        setIncludeStab: (includeStab) => set({ includeStab }),
      },
    }))
  );

  return (
    <DifficultyStoreContext.Provider value={store}>{children}</DifficultyStoreContext.Provider>
  );
};
