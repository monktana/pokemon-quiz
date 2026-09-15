# TextKey relies on keyof-of-a-union to enforce translation-key parity

`TextKey` (`src/util/localization/i18n.ts`) is defined as `keyof (typeof texts)[Language]`, not the more obvious `keyof typeof texts.en`. Because `Language` is a union of all supported languages, indexing `typeof texts` with it distributes into a union of every language block's type, and `keyof` of a union computes the *intersection* of their keys, not the union. So a key present in some language blocks but missing from others is silently excluded from `TextKey`, and any `getText(...)` call using it becomes a compile error — this is what already stops a translation key from going out of sync across languages, with no data restructuring needed.

## Consequences

Never replace `keyof (typeof texts)[Language]` with `keyof typeof texts.en` (or any single language) — it looks equivalent but only checks parity against that one language, silently disabling the cross-language completeness check for everyone else. A runtime test (`Localization.test.ts`) also asserts every language block has the same key set, as a guard independent of whether `tsc` actually ran before something shipped.
