import { describe, expect, it, vi } from 'vitest';

import { getResourceName } from '@/components';

const names = [
  { name: 'Fire', language: 'en' },
  { name: 'Feuer', language: 'de' },
];

describe('getResourceName', () => {
  it('returns the name matching the given locale', () => {
    expect(getResourceName(names, 'de')).toBe('Feuer');
  });

  it('falls back to English and warns when the locale is not present', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // @ts-expect-error intentionally passing an unsupported locale
    expect(getResourceName(names, 'pt')).toBe('Fire');
    expect(warnSpy).toHaveBeenCalledOnce();

    warnSpy.mockRestore();
  });

  it('falls back to the first available name when neither the locale nor English is present', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // @ts-expect-error intentionally passing an unsupported locale
    expect(getResourceName([{ name: 'Feuer', language: 'de' }], 'pt')).toBe('Feuer');
    expect(warnSpy).toHaveBeenCalledTimes(2);

    warnSpy.mockRestore();
  });

  it('returns an empty string when names is empty', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // @ts-expect-error intentionally passing an unsupported locale
    expect(getResourceName([], 'pt')).toBe('');

    warnSpy.mockRestore();
  });
});
