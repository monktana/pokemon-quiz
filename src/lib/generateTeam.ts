import { Pokemon } from '@/api/schema';
import { getPokemonDataset, hydratePokemon, PokemonDataset } from '@/lib/pokemonData';

export const TEAM_SIZE = 6;

const pickUniqueRandomRecords = (dataset: PokemonDataset, count: number) => {
  // moveIds only ever contains attacking moves (see PokemonRecord), so this
  // also excludes Pokemon whose only moves are status moves.
  const candidates = dataset.pokemon.filter((pokemon) => pokemon.moveIds.length > 0);

  if (candidates.length < count) {
    throw new Error(`Not enough eligible Pokemon: need ${count}, found ${candidates.length}`);
  }

  const shuffled = [...candidates].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

export const generateTeam = async (): Promise<Pokemon[]> => {
  const dataset = await getPokemonDataset();
  const records = pickUniqueRandomRecords(dataset, TEAM_SIZE);
  return records.map((record) => hydratePokemon(dataset, record));
};
