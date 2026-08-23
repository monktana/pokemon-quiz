import { Type, TypeEffectiveness } from '@/api/schema';
import { typeMatrix } from '@/data/typeMatrix';

/**
 * Calculates the effectiveness of an attacking type against one or more
 * defending types. Effectiveness is calculated against the defending types
 * combined (multiplicatively), not against each individually.
 */
export const calculateEffectiveness = (
  attackingType: Type,
  defendingTypes: Type[]
): TypeEffectiveness => {
  const multiplier = defendingTypes.reduce(
    (acc, defendingType) => acc * (typeMatrix[attackingType.name!][defendingType.name!] ?? 1),
    1
  );

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
