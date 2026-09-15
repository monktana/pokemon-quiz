# resetMatchupHistory can fire more than once per game, and that's fine

`useMatchup`'s reset ref-guard sits *before* `useSuspenseQuery`, so it runs on every render attempt for round 1's fetch - including attempts Suspense later discards. React throws away a render attempt's entire hook state (including `useRef`) if that attempt doesn't commit, so a fresh `false` ref, and another `resetMatchupHistory()` call, can happen a few times before the attempt that finally succeeds and commits. A test asserting this call happens exactly once is asserting an implementation detail of how many attempts Suspense needed, not a real requirement, and will be flaky against that.

This was verified harmless, not just assumed: `resetMatchupHistory()` sets the module state to fixed values with no dependency on prior state, so redundant calls before anything else touches that state are indistinguishable from a single call. `recordMatchupHistory` only ever runs later in the same hook, after a *non-throwing* return from `useSuspenseQuery` - meaning after a commit - so it can never land in between two of these pre-commit resets and get wiped out by a subsequent one. Only genuinely new renders of an *already-committed* instance (later rounds) matter for correctness, and the ref there correctly reads `true` and skips.

## Consequences

Don't test or "fix" this reset to fire exactly once - it can't, without moving the check somewhere later, which would reintroduce the ordering bug ADR-0001 documents (reset landing after `generateMatchup` already ran for round 1). Test the invariant that actually matters instead: no additional reset calls once a round has committed (see `getMatchup.test.tsx`).
