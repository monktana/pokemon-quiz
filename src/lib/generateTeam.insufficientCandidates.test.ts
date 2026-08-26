import { describe, expect, it, vi } from 'vitest';

import { generateTeam, TEAM_SIZE } from '@/lib/generateTeam';
import type { PokemonDataset } from '@/lib/pokemonData';

// Fewer eligible Pokemon (with at least one attacking move) than TEAM_SIZE
// requires, exercising pickUniqueRandomRecords' guard error.
const pokemonRecords = Array.from({ length: TEAM_SIZE - 1 }, (_, index) => {
  const id = index + 1;
  return {
    id,
    name: `fakemon-${id}`,
    species: { id, names: [{ name: `Fakemon ${id}`, language: 'en' }] },
    sprites: {},
    typeIds: [1],
    moveIds: [10],
  };
});

const fakeDataset: PokemonDataset = {
  pokemon: pokemonRecords,
  pokemonById: new Map(pokemonRecords.map((record) => [record.id, record])),
  movesById: new Map([[10, { id: 10, name: 'move-one', names: [], power: 50, typeId: 1 }]]),
  typesById: new Map([[1, { id: 1, name: 'fire', names: [] }]]),
} as unknown as PokemonDataset;

vi.mock('@/lib/pokemonData', async () => {
  const actual = await vi.importActual<typeof import('@/lib/pokemonData')>('@/lib/pokemonData');
  return {
    ...actual,
    getPokemonDataset: () => Promise.resolve(fakeDataset),
  };
});

describe('generateTeam with too few eligible Pokemon', () => {
  it('throws instead of returning a short team', async () => {
    await expect(generateTeam()).rejects.toThrow(
      `Not enough eligible Pokemon: need ${TEAM_SIZE}, found ${pokemonRecords.length}`
    );
  });
});
