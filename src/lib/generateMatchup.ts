import { Matchup } from '@/api/schema';
import { bucketizeEffectiveness, calculateEffectivenessMultiplier } from '@/lib/calculateEffectiveness';
import { getPokemonDataset, hydrateMove, hydratePokemon, PokemonDataset } from '@/lib/pokemonData';
import { randomItem } from '@/lib/random';

const pickDefenderRecord = (dataset: PokemonDataset, attackerId: number) => {
  const candidates = dataset.pokemon.filter((pokemon) => pokemon.id !== attackerId);
  return randomItem(candidates.length > 0 ? candidates : dataset.pokemon);
};

export const generateMatchup = async (attackerId: number): Promise<Matchup> => {
  const dataset = await getPokemonDataset();

  const attackerRecord = dataset.pokemonById.get(attackerId)!;
  const defenderRecord = pickDefenderRecord(dataset, attackerId);
  const moveId = randomItem(attackerRecord.moveIds);

  const attacker = hydratePokemon(dataset, attackerRecord);
  const defender = hydratePokemon(dataset, defenderRecord);
  const move = hydrateMove(dataset, moveId);

  const multiplier = calculateEffectivenessMultiplier(move.type!, defender.types!);

  return {
    attacker,
    defender,
    move,
    multiplier,
    effectiveness: bucketizeEffectiveness(multiplier),
    stabEligible: attacker.types!.some((type) => type.id === move.type!.id),
  };
};
