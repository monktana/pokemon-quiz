# Matchup history recording happens at consumption time, not in the fetch layer

Repeat-penalty state (`src/lib/matchupHistory.ts`) must be recorded exactly once per matchup the player actually sees. `generateMatchup`'s `queryFn` runs for both the real round's `useMatchup` call and the speculative `usePrefetchMatchup` call, and React Query only invokes it once per cache key — so at the moment a fetch resolves, it isn't yet known whether that result will be the one the player is shown or a discarded prefetch (e.g. after a team switch or faint changes the next round's attacker). Recording inside the queryFn/session layer would reintroduce the exact bug fixed in PR #31: a discarded prefetch would silently corrupt the streak counters that reduce repeated attack types/effectiveness. Recording instead lives inside `useMatchup` (`src/api/queries/getMatchup.ts`), keyed on the resolved `data` reference actually being rendered by the component that called the hook — the only point that reliably knows "this is the matchup being shown."

## Considered Options

- **Fetch/session-layer recording** (a session wrapping `getMatchup` that records on every resolved fetch): rejected — cannot distinguish a fetch that will actually be displayed from a discarded prefetch, since both go through the same `queryFn` and React Query dedupes by cache key.
- **Consumption-time recording inside `useMatchup`** (chosen): the reset/record ref-guard mechanism lives inside `useMatchup` itself, so it fires exactly once per matchup that reaches render, regardless of how many discarded prefetches ran for other keys.

## Consequences

Don't move this recording into `getMatchup.ts`'s `queryFn`, `generateMatchup`, or any other module that resolves ahead of what's actually displayed, even though that looks like the cleaner seam. The ref-guard mechanics have to stay tied to the render that actually consumes the data.
