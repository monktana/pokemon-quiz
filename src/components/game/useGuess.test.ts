import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Matchup, TypeEffectiveness } from '@/api/schema';
import { useGuess } from '@/components/game/useGuess';

const matchup: Matchup = { effectiveness: TypeEffectiveness.SuperEffective };

describe('useGuess', () => {
  it('returns true when the guess matches the matchup effectiveness', () => {
    const { result } = renderHook(() => useGuess(matchup));

    expect(result.current.makeGuess(TypeEffectiveness.SuperEffective)).toBe(true);
  });

  it('returns false when the guess does not match', () => {
    const { result } = renderHook(() => useGuess(matchup));

    expect(result.current.makeGuess(TypeEffectiveness.NotVeryEffective)).toBe(false);
  });
});
