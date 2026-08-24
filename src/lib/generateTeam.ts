import { Pokemon } from '@/api/schema';
import { getPokemonDataset, hydratePokemon, PokemonDataset } from '@/lib/pokemonData';

export const TEAM_SIZE = 6;

const pickUniqueRandomRecords = (dataset: PokemonDataset, count: number) => {
  // Only Pokemon that can actually learn a move are eligible to attack.
  const candidates = dataset.pokemon.filter((pokemon) => pokemon.moveIds.length > 0);
  const shuffled = [...candidates].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

export const generateTeam = async (): Promise<Pokemon[]> => {
  const dataset = await getPokemonDataset();
  const records = pickUniqueRandomRecords(dataset, TEAM_SIZE);
  return records.map((record) => hydratePokemon(dataset, record));
};
