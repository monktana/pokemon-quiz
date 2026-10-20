import React, { createContext, type PropsWithChildren, useContext, useState } from 'react';
import { createStore, type StateCreator, type StoreApi, useStore } from 'zustand';

/**
 * Absorbs the Context + null-check + Provider boilerplate shared by every
 * context-scoped Zustand store in this app (Score, Difficulty, Language).
 * Three near-identical hand-copies of this exact shape is what justified
 * pulling it into a real seam - see docs/adr/0002 for when to reach for
 * this versus a bare module-scope `create()`.
 *
 * `TProps` is whatever a store needs to compute its initial state (e.g.
 * Score's `initialScore`), threaded straight through as the Provider's own
 * props alongside `children`.
 */
export const createStoreContext = <TState, TProps extends object = Record<string, never>>(
  storeName: string,
  createInitialState: (props: TProps) => StateCreator<TState>
) => {
  const Context = createContext<StoreApi<TState> | null>(null);

  const useStoreSelector = <TSelected,>(selector: (state: TState) => TSelected): TSelected => {
    const store = useContext(Context);
    if (!store) {
      throw new Error(`Missing ${storeName}Provider`);
    }
    return useStore(store, selector);
  };

  const Provider = ({ children, ...props }: PropsWithChildren<TProps>) => {
    const [store] = useState(() => createStore<TState>()(createInitialState(props as TProps)));
    return <Context.Provider value={store}>{children}</Context.Provider>;
  };

  return { Provider, useStoreSelector };
};
