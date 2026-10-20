import { type PropsWithChildren } from 'react';

import { createStoreContext } from '@/stores/createStoreContext';

export type ScoreStore = {
  score: number;
  actions: {
    increase: () => void;
    decrease: () => void;
    reset: () => void;
  };
};

type ScoreStoreProps = { initialScore: number };
export type ScoreStoreProviderProps = PropsWithChildren<ScoreStoreProps>;

const { Provider, useStoreSelector } = createStoreContext<ScoreStore, ScoreStoreProps>(
  'Score',
  ({ initialScore }) =>
    (set) => ({
      score: initialScore,
      actions: {
        increase: () => set((state) => ({ score: state.score + 1 })),
        decrease: () => set((state) => ({ score: state.score - 1 })),
        reset: () => set({ score: 0 }),
      },
    })
);

export const ScoreStoreProvider = Provider;
export const useScore = () => useStoreSelector((state) => state.score);
export const useScoreActions = () => useStoreSelector((state) => state.actions);
