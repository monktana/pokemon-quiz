import { describe, expect, it } from 'vitest';

import { TypeEffectiveness } from '@/api/schema';
import {
  calculateEffectiveness,
  calculateEffectivenessMultiplier,
} from '@/lib/calculateEffectiveness';
import { dragon, fire, flying, ghost, grass, ice, normal, water } from '@/lib/testing/fixtures/type';

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

  it('multiplies effectiveness across dual defending types (4x)', () => {
    // ice vs grass (2x) * flying (2x) = 4x -> SuperEffective
    expect(calculateEffectiveness(ice, [grass, flying])).toBe(TypeEffectiveness.SuperEffective);
  });

  it('multiplies effectiveness across dual defending types (0.25x)', () => {
    // fire vs fire (0.5x) * dragon (0.5x) = 0.25x -> NotVeryEffective
    expect(calculateEffectiveness(fire, [fire, dragon])).toBe(TypeEffectiveness.NotVeryEffective);
  });

  it('defaults to a neutral multiplier when the defending type is missing from the matrix row', () => {
    const unknown = { id: 999, name: 'cosmic', names: [] };
    expect(calculateEffectiveness(fire, [unknown])).toBe(TypeEffectiveness.Effective);
  });
});

describe('calculateEffectivenessMultiplier', () => {
  it('returns the raw multiplier for a single-type advantage', () => {
    expect(calculateEffectivenessMultiplier(water, [fire])).toBe(2);
  });

  it('returns the raw multiplier for a single-type disadvantage', () => {
    expect(calculateEffectivenessMultiplier(fire, [water])).toBe(0.5);
  });

  it('returns 0 for an immunity', () => {
    expect(calculateEffectivenessMultiplier(normal, [ghost])).toBe(0);
  });

  it('multiplies across dual defending types', () => {
    expect(calculateEffectivenessMultiplier(ice, [grass, flying])).toBe(4);
    expect(calculateEffectivenessMultiplier(fire, [fire, dragon])).toBe(0.25);
  });
});
