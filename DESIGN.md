# Pokémon Quiz — Design System

## 1. Visual Theme and Atmosphere

A handheld Pokédex battle terminal. The Battle screen reads as a device screen inside a
bezel, not a stack of generic cards: a technical HUD display face, a neutral steel/ink
frame, and the matchup's own type colors doing the accent work instead of grey boxes.
Retro-technical, not retro-kitsch: angular corners and a monospace-flavored display face,
no pixel font, no 8-bit ornament. Density is low, this is a single-column utility screen
played in short repeated bursts (many rounds per session), so every recurring interaction
(the 4 guess buttons) gets real tactile feedback.

## 2. Color Palette and Roles

The 18 existing Pokémon-type color scales (`--color-<type>-50..900` in `src/index.css`)
stay untouched, they are already a deliberate, correctly-tuned system. This redesign makes
them load-bearing instead of decorative: type panels now tint from `--type-subtle` /
`--type-muted` / `--type-solid`, which already exist per type.

New tokens (add to `@theme` in `src/index.css`):

| Token | Light | Dark | Role |
|---|---|---|---|
| `--color-canvas` | `oklch(97.5% 0.004 30)` | `oklch(16% 0.006 30)` | page background, warm-neutral tint toward brand red |
| `--color-bezel` | `oklch(93% 0.006 30)` | `oklch(21% 0.008 30)` | the console frame around the battle screen |
| `--color-bezel-border` | `oklch(55% 0.01 30)` | `oklch(38% 0.01 30)` | 2px frame border |
| `--color-surface` | `oklch(100% 0 0)` | `oklch(100% 0 0 / 0.04)` | neutral panel bg (question box, button tray, navbar) — dark uses white-overlay-on-canvas per the dark surface rule |
| `--color-surface-border` | `oklch(85% 0.005 30)` | `oklch(100% 0 0 / 0.08)` | neutral panel border |
| `--color-feedback-correct` | `oklch(72% 0.15 165)` | `oklch(78% 0.15 165)` | guess-result flash, distinct from grass/ice hues |
| `--color-feedback-incorrect` | reuse `--color-red-500` (Tailwind default, already used by `Pokeball`) | same | guess-result flash, ties to the existing Poké Ball red brand accent |

60/30/10: canvas + bezel are the 60% neutral base, type-tinted panels + surface borders are
the 30%, feedback colors and the bezel-border accent are the 10% that only appears on
result/action.

## 3. Typography Rules

Font: **Chakra Petch** (Google Fonts, open, named foundry Cadson Demak). Rejected first
instincts: Space Grotesk, Inter, Space Mono, all reflex picks that communicate nothing.
Chakra Petch has cut-corner letterforms (genuine HUD/terminal character) and a real weight
range, one family used everywhere so nothing competes with it.

Load in `index.html`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700&display=swap" rel="stylesheet">
```
`font-display: swap` is already covered by the URL param.

| Role | Size | Weight | Line-height | Tracking |
|---|---|---|---|---|
| Pokémon name | 28px / `1.75rem` | 700 | 1.1 | -0.012em |
| Score value | 20px / `1.25rem` | 700 | 1.1 | normal, `tabular-nums` |
| Section label (SCORE, VS) | 13px / `0.8125rem` | 600 uppercase | 1.2 | +0.04em (uppercase-label exception to the no-positive-tracking rule) |
| Question body | 18px / `1.125rem` | 400 | 1.5 | normal |
| Button label | 14px / `0.875rem` | 600 uppercase | 1.2 | +0.03em |
| Type tag | 13px / `0.8125rem` | 500 | 1.2 | normal |

`text-wrap: balance` on the Pokémon name, `text-wrap: pretty` on the question sentence.

## 4. Component Stylings

**Guess buttons** (the core repeated interaction, tapped every round):
- Rest: `bg-surface`, `border-surface-border`, weight 600 uppercase label, `min-h-14` (56px, clears the 40px minimum with room for a two-line label at 320px width)
- Press (not hover-dependent): `scale(0.96)`, 120ms `ease-out`, `transition-property: scale`
- Result flash: on submit, the clicked button transitions `background-color` to `--color-feedback-correct` or `--color-feedback-incorrect` for 400ms then reverts as the round advances
- Disabled (fetching/pending): `opacity-60`, no press-scale
- Kept deliberately equal-weight and un-color-coded by severity, the player judges effectiveness, the UI doesn't spoil it

**Type-tinted Pokémon panel**:
- Background `--type-subtle`, border `--type-muted`, a 4px solid top bar in `--type-solid` (a background swatch, not a side border, per the Absolute Bans table)
- Name in `--type-fg` (existing token), sprite keeps `image-rendering: pixelated`
- Concentric radius: panel `radius-lg` (14px), top bar meets the panel corner at the same curve

**Bezel frame** (new, wraps the whole Battle screen):
- `bg-bezel`, `border-2 border-bezel-border`, `radius-lg`, `p-3` sm / `p-4` md+
- Contains: status row (score + team) → attacker/defender panels → question → button tray, all on `bg-canvas` inside the bezel padding

**Team indicator**: existing `Pokeball` component, size bumped for legibility, active Pokémon gets a `ring-2 ring-(--type-solid)` in its own type color, fainted transitions `opacity-40 scale-90` over 200ms (was an instant `grayscale` class swap)

**Buttons (Menu/GameOver primary CTA)**: same button base, `radius-md`, full Chakra Petch treatment, press-scale added (currently missing entirely)

## 5. Layout Principles

Single-column utility layout, unchanged structurally, `max-w-3xl` container (existing).
Spacing stays on Tailwind's 4px scale: `gap-2` (8px) inside a panel group, `gap-4` (16px)
between the bezel's major sections, bezel padding `p-3`/`p-4` scales at `md:`. No new grid
system needed, this screen has never needed multi-column layout.

## 6. Depth and Elevation

- Light: canvas → bezel is a +4%-lightness step (satisfies the light-mode surface-hierarchy
  minimum); neutral surfaces (question box, button tray) get `box-shadow: 0 1px 3px rgba(0,0,0,0.10)` instead of relying on a border alone; type-tinted panels get elevation from
  their own `--type-subtle` color step, no shadow needed.
- Dark: canvas is near-black (`--color-canvas` dark); bezel and neutral surfaces use white-
  overlay steps per the dark-mode rule (`--color-surface` = `white/4%`), borders at `white/8%`.
  Type panels keep their existing dark `--type-subtle`/`--type-muted` overrides already
  defined in `index.css`.

## 7. Do's and Don'ts

- Do use `--type-solid` as a single accent bar per panel, not a full saturated fill (keeps text legible)
- Do press-scale every tappable element, including the two GameOver CTAs which currently have none
- Do keep the 4 guess buttons equal-weight and un-color-coded by outcome severity
- Don't stack more than two bordered boxes flush against each other, that's the template pattern being replaced
- Don't add an animation library, CSS transitions only (bundle-size constraint, this is a small static-hosted side project)
- Don't use a pixel/8-bit font, the direction is technical-HUD, not retro-kitsch
- Don't touch the 18 type color hex values
- Don't use a side border as a panel accent, use the top bar swatch instead

## 8. Responsive Behavior

- Breakpoint: single column below `md`, same single column at `max-w-3xl` above it, this
  screen never needs a second column
- Fix (regardless of restyle): at 375px the defender panel currently clips the Pokémon name
  and overflows the last type tag off-screen. The reversed-row panel needs `min-w-0` on the
  text column and the name needs `truncate` or the panel needs to allow wrapping instead of
  a fixed sprite width crowding it out
- Touch targets: guess buttons move from the current default `h-10` (40px, right at the
  minimum and cramped in a 2-column grid) to `min-h-14` (56px)
- Verify at 375px, 320px, and 1280px in both themes before handoff

## 9. Agent Prompt Guide

Quick reference:
```
canvas: var(--color-canvas)        bezel: var(--color-bezel)
bezel-border: var(--color-bezel-border)
surface: var(--color-surface)      surface-border: var(--color-surface-border)
feedback-correct: var(--color-feedback-correct)
feedback-incorrect: var(--color-feedback-incorrect)
type panel bg: var(--type-subtle)  type panel border: var(--type-muted)  type accent bar: var(--type-solid)
font: 'Chakra Petch', ui-sans-serif, system-ui, sans-serif
radius: sm 4px / md 8px / lg 14px / pill 9999px
```

Example component prompts:
- "Build the Battle bezel frame: `bg-bezel border-2 border-bezel-border radius-lg p-3 md:p-4`, containing the status row, the two Pokémon panels, the question box, and the button tray, all inset on `bg-canvas`."
- "Build a type-tinted Pokémon panel: `bg-(--type-subtle) border border-(--type-muted) radius-lg`, a 4px top bar in `bg-(--type-solid)`, name at 28px/700/-0.012em in `var(--type-fg)`, sprite `h-32 w-32` pixelated, `min-w-0` on the text column with `truncate` on the name so it never clips at 375px."
- "Build a guess button: `bg-surface border border-surface-border radius-md min-h-14`, label 14px/600/uppercase/+0.03em, `active:scale-96 transition-[scale] duration-120`, on submit transition `background-color` to `--color-feedback-correct`/`--color-feedback-incorrect` for 400ms."
- "Build the team indicator: existing `Pokeball` size bumped to `h-8 w-8`, active Pokémon gets `ring-2 ring-(--type-solid)`, fainted transitions to `opacity-40 scale-90` over 200ms instead of instant grayscale."
