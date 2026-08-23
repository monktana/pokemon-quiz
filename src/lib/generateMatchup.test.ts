import { describe, expect, it, vi } from 'vitest';

import { calculateEffectiveness } from '@/lib/calculateEffectiveness';
import { generateMatchup } from '@/lib/generateMatchup';
import type { PokemonDataset } from '@/lib/pokemonData';

const fakeDataset: PokemonDataset = {
  pokemon: [
    {
      id: 1,
      name: 'fakemon-one',
      species: { id: 1, names: [{ name: 'Fakemon One', language: 'en' }] },
      sprites: {},
      typeIds: [1],
      moveIds: [10],
    },
    {
      id: 2,
      name: 'fakemon-two',
      species: { id: 2, names: [{ name: 'Fakemon Two', language: 'en' }] },
      sprites: {},
      typeIds: [2],
      moveIds: [11],
    },
    {
      id: 3,
      name: 'fakemon-three',
      species: { id: 3, names: [{ name: 'Fakemon Three', language: 'en' }] },
      sprites: {},
      typeIds: [3],
      moveIds: [12],
    },
  ],
  movesById: new Map([
    [10, { id: 10, name: 'move-one', names: [], power: 50, typeId: 1 }],
    [11, { id: 11, name: 'move-two', names: [], power: 40, typeId: 2 }],
    [12, { id: 12, name: 'move-three', names: [], power: 60, typeId: 3 }],
  ]),
  typesById: new Map([
    [1, { id: 1, name: 'fire', names: [] }],
    [2, { id: 2, name: 'water', names: [] }],
    [3, { id: 3, name: 'grass', names: [] }],
  ]),
} as unknown as PokemonDataset;

vi.mock('@/lib/pokemonData', async () => {
  const actual = await vi.importActual<typeof import('@/lib/pokemonData')>('@/lib/pokemonData');
  return {
    ...actual,
    getPokemonDataset: () => Promise.resolve(fakeDataset),
  };
});

describe('generateMatchup', () => {
  it('never picks the same Pokemon as attacker and defender', async () => {
    for (let i = 0; i < 50; i++) {
      const matchup = await generateMatchup();
      expect(matchup.attacker!.id).not.toBe(matchup.defender!.id);
    }
  });

  it("picks a move that belongs to the attacker's move pool", async () => {
    const matchup = await generateMatchup();
    const attackerRecord = fakeDataset.pokemon.find((p) => p.id === matchup.attacker!.id)!;
    expect(attackerRecord.moveIds).toContain(matchup.move!.id);
  });

  it('computes effectiveness consistently with calculateEffectiveness', async () => {
    const matchup = await generateMatchup();
    const expected = calculateEffectiveness(matchup.move!.type!, matchup.defender!.types!);
    expect(matchup.effectiveness).toBe(expected);
  });

  it('omits the unused moves field on attacker and defender', async () => {
    const matchup = await generateMatchup();
    expect(matchup.attacker!.moves).toBeUndefined();
    expect(matchup.defender!.moves).toBeUndefined();
  });
});
