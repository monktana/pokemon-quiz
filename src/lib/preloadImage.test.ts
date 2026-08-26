import { afterEach, describe, expect, it, vi } from 'vitest';

import { preloadImage } from '@/lib/preloadImage';

describe('preloadImage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('creates an Image and assigns it the given src, warming the browser cache', () => {
    const src = '/sprites/bulbasaur.png';
    let assignedSrc: string | undefined;

    class FakeImage {
      set src(value: string) {
        assignedSrc = value;
      }
    }

    vi.stubGlobal('Image', FakeImage);

    preloadImage(src);

    expect(assignedSrc).toBe(src);
  });
});
