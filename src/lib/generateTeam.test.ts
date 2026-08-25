import { describe, expect, it, vi } from 'vitest';

import { generateTeam, TEAM_SIZE } from '@/lib/generateTeam';
import type { PokemonDataset } from '@/lib/pokemonData';

const pokemonRecords = Array.from({ length: 10 }, (_, index) => {
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

const movelessPokemonId = 999;
pokemonRecords.push({
  id: movelessPokemonId,
  name: 'fakemon-moveless',
  species: { id: movelessPokemonId, names: [{ name: 'Fakemon Moveless', language: 'en' }] },
  sprites: {},
  typeIds: [1],
  moveIds: [],
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

describe('generateTeam', () => {
  it('picks exactly TEAM_SIZE Pokemon', async () => {
    const team = await generateTeam();
    expect(team).toHaveLength(TEAM_SIZE);
  });

  it('never picks the same Pokemon twice', async () => {
    const team = await generateTeam();
    const ids = team.map((pokemon) => pokemon.id);
    expect(new Set(ids).size).toBe(TEAM_SIZE);
  });

  it('only picks Pokemon that exist in the dataset', async () => {
    const team = await generateTeam();
    const datasetIds = new Set(pokemonRecords.map((record) => record.id));
    team.forEach((pokemon) => expect(datasetIds.has(pokemon.id!)).toBe(true));
  });

  it('never picks a Pokemon that cannot learn any move', async () => {
    for (let i = 0; i < 20; i++) {
      const team = await generateTeam();
      expect(team.some((pokemon) => pokemon.id === movelessPokemonId)).toBe(false);
    }
  });
});
