import { describe, expect, it } from 'vitest';

import { getResourceName } from '@/components';

const names = [
  { name: 'Fire', language: 'en' },
  { name: 'Feuer', language: 'de' },
];

describe('getResourceName', () => {
  it('returns the name matching the given locale', () => {
    expect(getResourceName(names, 'de')).toBe('Feuer');
  });

  it('returns a fallback string when the locale is not present', () => {
    // @ts-expect-error intentionally passing an unsupported locale
    expect(getResourceName(names, 'pt')).toBe('getResourceName: locale (pt) not present in names');
  });
});
