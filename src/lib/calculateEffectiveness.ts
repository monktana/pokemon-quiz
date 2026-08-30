import { Type, TypeEffectiveness } from '@/api/schema';
import { typeMatrix } from '@/data/typeMatrix';

/**
 * Calculates the raw effectiveness multiplier of an attacking type against
 * one or more defending types, combined multiplicatively (not individually).
 */
export const calculateEffectivenessMultiplier = (
  attackingType: Type,
  defendingTypes: Type[]
): number =>
  defendingTypes.reduce(
    (acc, defendingType) => acc * (typeMatrix[attackingType.name!][defendingType.name!] ?? 1),
    1
  );

/** Collapses a raw effectiveness multiplier into the 4 in-game categories. */
export const bucketizeEffectiveness = (multiplier: number): TypeEffectiveness => {
  switch (multiplier) {
    case 0:
      return TypeEffectiveness.NoEffect;
    case 0.25:
    case 0.5:
      return TypeEffectiveness.NotVeryEffective;
    case 2:
    case 4:
      return TypeEffectiveness.SuperEffective;
    default:
      return TypeEffectiveness.Effective;
  }
};

export const calculateEffectiveness = (
  attackingType: Type,
  defendingTypes: Type[]
): TypeEffectiveness =>
  bucketizeEffectiveness(calculateEffectivenessMultiplier(attackingType, defendingTypes));
