# When to use the store-context factory vs. a bare module-scope store

Score, Difficulty, and Language each go through `createStoreContext` (a React Context + Provider) because each needs a configurable initial value supplied at mount time (`initialScore`, `initialLanguage`, `initialMode`), which as a side effect also gives every test suite its own isolated store instance per render. `appState` is a bare module-scope `create()` instead, because it never takes a configurable initial value — it always starts at `'menu'` — so a Provider would introduce a seam with no second adapter to justify it.

## Consequences

Rule for future stores: reach for `createStoreContext` by default. Only use a bare `create()` when the store demonstrably never needs a per-instance configurable initial value — if that changes, move it onto the factory instead of bolting a prop onto the module-level store.
