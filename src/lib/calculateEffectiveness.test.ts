import { describe, expect, it } from 'vitest';

import { TypeEffectiveness } from '@/api/schema';
import { calculateEffectiveness } from '@/lib/calculateEffectiveness';
import { fire, flying, ghost, grass, ice, normal, water } from '@/lib/testing/fixtures/type';

describe('calculateEffectiveness', () => {
  it('returns SuperEffective for a single-type advantage', () => {
    expect(calculateEffectiveness(water, [fire])).toBe(TypeEffectiveness.SuperEffective);
  });

  it('returns NotVeryEffective for a single-type disadvantage', () => {
    expect(calculateEffectiveness(fire, [water])).toBe(TypeEffectiveness.NotVeryEffective);
  });

  it('returns NoEffect for an immunity', () => {
    expect(calculateEffectiveness(normal, [ghost])).toBe(TypeEffectiveness.NoEffect);
  });

  it('returns Effective for a neutral match up', () => {
    expect(calculateEffectiveness(normal, [normal])).toBe(TypeEffectiveness.Effective);
  });

  it('multiplies effectiveness across dual defending types', () => {
    // ice vs grass (2x) * flying (2x) = 4x -> SuperEffective
    expect(calculateEffectiveness(ice, [grass, flying])).toBe(TypeEffectiveness.SuperEffective);
  });
});
