import { describe, expect, it, vi } from 'vitest';

import { shouldAskStab, shouldSwitchAttacker } from '@/lib/roundChance';

describe('shouldAskStab', () => {
  it('returns true when the roll lands below the STAB question chance', () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);
    expect(shouldAskStab()).toBe(true);
    randomSpy.mockRestore();
  });

  it('returns false when the roll lands exactly on the STAB question chance', () => {
    // chance() uses a strict `<`, so landing exactly on the threshold (0.2)
    // must not trigger it - this also pins the constant's actual value,
    // unlike a generic "above" check that would pass for any threshold.
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.2);
    expect(shouldAskStab()).toBe(false);
    randomSpy.mockRestore();
  });

  it('returns false when the roll lands above the STAB question chance', () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.99);
    expect(shouldAskStab()).toBe(false);
    randomSpy.mockRestore();
  });

  it('returns false between the STAB chance and the switch chance, distinguishing the two thresholds', () => {
    // 0.3 sits strictly between STAB_QUESTION_CHANCE (0.2) and
    // ATTACKER_SWITCH_CHANCE (0.4) - if the two constants were ever swapped
    // or mistyped to the same value, this would catch it, unlike 0/0.99
    // alone which land on the same side of both thresholds either way.
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.3);
    expect(shouldAskStab()).toBe(false);
    randomSpy.mockRestore();
  });
});

describe('shouldSwitchAttacker', () => {
  it('returns true when the roll lands below the switch chance', () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);
    expect(shouldSwitchAttacker()).toBe(true);
    randomSpy.mockRestore();
  });

  it('returns false when the roll lands exactly on the switch chance', () => {
    // chance() uses a strict `<`, so landing exactly on the threshold (0.4)
    // must not trigger it - this also pins the constant's actual value.
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.4);
    expect(shouldSwitchAttacker()).toBe(false);
    randomSpy.mockRestore();
  });

  it('returns false when the roll lands above the switch chance', () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.99);
    expect(shouldSwitchAttacker()).toBe(false);
    randomSpy.mockRestore();
  });

  it('returns true between the STAB chance and the switch chance, distinguishing the two thresholds', () => {
    // Same 0.3 roll as shouldAskStab's equivalent test, but the opposite
    // result - proof the two functions read their own distinct constant
    // rather than both happening to agree on some other shared value.
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.3);
    expect(shouldSwitchAttacker()).toBe(true);
    randomSpy.mockRestore();
  });
});
