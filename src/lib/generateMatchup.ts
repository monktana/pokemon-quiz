import { Matchup } from '@/api/schema';
import { calculateEffectiveness } from '@/lib/calculateEffectiveness';
import { getPokemonDataset, hydrateMove, hydratePokemon, PokemonDataset } from '@/lib/pokemonData';

const randomItem = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

const pickDefenderRecord = (dataset: PokemonDataset, attackerId: number) => {
  const candidates = dataset.pokemon.filter((pokemon) => pokemon.id !== attackerId);
  return randomItem(candidates.length > 0 ? candidates : dataset.pokemon);
};

export const generateMatchup = async (): Promise<Matchup> => {
  const dataset = await getPokemonDataset();

  const attackerRecord = randomItem(dataset.pokemon);
  const defenderRecord = pickDefenderRecord(dataset, attackerRecord.id);
  const moveId = randomItem(attackerRecord.moveIds);

  const attacker = hydratePokemon(dataset, attackerRecord);
  const defender = hydratePokemon(dataset, defenderRecord);
  const move = hydrateMove(dataset, moveId);

  return {
    attacker,
    defender,
    move,
    effectiveness: calculateEffectiveness(move.type!, defender.types!),
  };
};
