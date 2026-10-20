import { create } from 'zustand';

// A bare module-scope store, not a createStoreContext (see
// docs/adr/0002-store-context-factory-vs-bare-store.md): it never takes a
// configurable initial value - it always starts at 'menu' - so a Provider
// would introduce a seam with no second adapter to justify it. If that ever
// changes, move this onto createStoreContext instead of bolting a prop onto
// a module-level store.
type AppState = 'menu' | 'quiz' | 'gameover';

type AppStateStore = {
  appState: AppState;
  actions: {
    startQuiz: () => void;
    endQuiz: () => void;
    openMenu: () => void;
  };
};

const useAppStateStore = create<AppStateStore>()((set) => ({
  appState: 'menu',
  actions: {
    startQuiz: () => set({ appState: 'quiz' }),
    endQuiz: () => set({ appState: 'gameover' }),
    openMenu: () => set({ appState: 'menu' }),
  },
}));

export const useAppState = () => useAppStateStore((state) => state.appState);
export const useAppStateActions = () => useAppStateStore((state) => state.actions);
