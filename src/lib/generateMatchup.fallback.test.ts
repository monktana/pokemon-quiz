import { describe, expect, it, vi } from 'vitest';

import { generateMatchup } from '@/lib/generateMatchup';
import type { PokemonDataset } from '@/lib/pokemonData';

// A dataset with only the attacker in it: filtering out the attacker leaves
// zero defender candidates, exercising pickDefenderRecord's fallback to the
// full (unfiltered) dataset instead of throwing/picking from an empty array.
const soleRecord = {
  id: 1,
  name: 'fakemon-solo',
  species: { id: 1, names: [{ name: 'Fakemon Solo', language: 'en' }] },
  sprites: {},
  typeIds: [1],
  moveIds: [10],
};

const fakeDataset: PokemonDataset = {
  pokemon: [soleRecord],
  pokemonById: new Map([[soleRecord.id, soleRecord]]),
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

describe('generateMatchup with a single-Pokemon dataset', () => {
  it('falls back to the attacker itself as defender when no other candidate exists', async () => {
    const matchup = await generateMatchup(soleRecord.id);

    expect(matchup.attacker!.id).toBe(soleRecord.id);
    expect(matchup.defender!.id).toBe(soleRecord.id);
  });
});
