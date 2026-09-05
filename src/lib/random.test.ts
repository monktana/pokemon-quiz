import { describe, expect, it, vi } from 'vitest';

import { chance, randomItem, shuffle } from '@/lib/random';

describe('chance', () => {
  it('returns true when the roll lands below the probability', () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.1);
    expect(chance(0.5)).toBe(true);
    randomSpy.mockRestore();
  });

  it('returns false when the roll lands at or above the probability', () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5);
    expect(chance(0.5)).toBe(false);
    randomSpy.mockRestore();
  });
});

describe('randomItem', () => {
  it('picks the item at the rolled index', () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5);
    expect(randomItem(['a', 'b', 'c', 'd'])).toBe('c');
    randomSpy.mockRestore();
  });

  it('always picks the only item in a single-element array', () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.9);
    expect(randomItem(['only'])).toBe('only');
    randomSpy.mockRestore();
  });
});

describe('shuffle', () => {
  it('returns every original item exactly once', () => {
    const items = [1, 2, 3, 4, 5];
    const shuffled = shuffle(items);
    expect(shuffled).toHaveLength(items.length);
    expect([...shuffled].sort()).toEqual([...items].sort());
  });

  it('does not mutate the input array', () => {
    const items = [1, 2, 3];
    const original = [...items];
    shuffle(items);
    expect(items).toEqual(original);
  });
});
