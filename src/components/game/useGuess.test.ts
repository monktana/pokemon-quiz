import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TypeEffectiveness } from '@/api/schema';
import { useGuess } from '@/components/game/useGuess';

describe('useGuess', () => {
  it('returns true when the guess matches a bucketed effectiveness answer', () => {
    const { result } = renderHook(() => useGuess(TypeEffectiveness.SuperEffective));

    expect(result.current.makeGuess(TypeEffectiveness.SuperEffective)).toBe(true);
  });

  it('returns false when the bucketed guess does not match', () => {
    const { result } = renderHook(() => useGuess(TypeEffectiveness.SuperEffective));

    expect(result.current.makeGuess(TypeEffectiveness.NotVeryEffective)).toBe(false);
  });

  it('returns true when the guess matches a precise multiplier answer', () => {
    const { result } = renderHook(() => useGuess(0.5));

    expect(result.current.makeGuess(0.5)).toBe(true);
  });

  it('returns false when the multiplier guess does not match', () => {
    const { result } = renderHook(() => useGuess(0.5));

    expect(result.current.makeGuess(2)).toBe(false);
  });

  it('returns true when the guess matches a STAB (boolean) answer', () => {
    const { result } = renderHook(() => useGuess(true));

    expect(result.current.makeGuess(true)).toBe(true);
  });

  it('returns false when the STAB guess does not match', () => {
    const { result } = renderHook(() => useGuess(true));

    expect(result.current.makeGuess(false)).toBe(false);
  });
});
