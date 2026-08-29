import { describe, expect, it, vi } from 'vitest';

import { calculateEffectiveness, calculateEffectivenessMultiplier } from '@/lib/calculateEffectiveness';
import { generateMatchup } from '@/lib/generateMatchup';
import { getPokemonDataset, type PokemonDataset } from '@/lib/pokemonData';

const pokemonRecords = [
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
];

const fakeDataset: PokemonDataset = {
  pokemon: pokemonRecords,
  pokemonById: new Map(pokemonRecords.map((record) => [record.id, record])),
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
    getPokemonDataset: vi.fn(() => Promise.resolve(fakeDataset)),
  };
});

const attackerId = 1;

describe('generateMatchup', () => {
  it('never picks the same Pokemon as attacker and defender', async () => {
    for (let i = 0; i < 50; i++) {
      const matchup = await generateMatchup(attackerId);
      expect(matchup.attacker!.id).toBe(attackerId);
      expect(matchup.defender!.id).not.toBe(attackerId);
    }
  });

  it("picks a move that belongs to the attacker's move pool", async () => {
    const matchup = await generateMatchup(attackerId);
    const attackerRecord = fakeDataset.pokemon.find((p) => p.id === attackerId)!;
    expect(attackerRecord.moveIds).toContain(matchup.move!.id);
  });

  it('computes effectiveness consistently with calculateEffectiveness', async () => {
    const matchup = await generateMatchup(attackerId);
    const expected = calculateEffectiveness(matchup.move!.type!, matchup.defender!.types!);
    expect(matchup.effectiveness).toBe(expected);
  });

  it('omits the unused moves field on attacker and defender', async () => {
    const matchup = await generateMatchup(attackerId);
    expect(matchup.attacker!.moves).toBeUndefined();
    expect(matchup.defender!.moves).toBeUndefined();
  });

  it('computes the raw multiplier consistently with calculateEffectivenessMultiplier', async () => {
    const matchup = await generateMatchup(attackerId);
    const expected = calculateEffectivenessMultiplier(matchup.move!.type!, matchup.defender!.types!);
    expect(matchup.multiplier).toBe(expected);
  });

  it("marks stabEligible when the move's type is among the attacker's types", async () => {
    // Every fakemon in this dataset only knows a move matching its own type.
    const matchup = await generateMatchup(attackerId);
    expect(matchup.stabEligible).toBe(true);
  });

  it("marks stabEligible false when the move's type is not among the attacker's types", async () => {
    const offTypeRecords = [
      {
        id: 1,
        name: 'off-type-attacker',
        species: { id: 1, names: [{ name: 'Off Type Attacker', language: 'en' }] },
        sprites: {},
        typeIds: [1],
        moveIds: [11],
      },
      {
        id: 2,
        name: 'off-type-defender',
        species: { id: 2, names: [{ name: 'Off Type Defender', language: 'en' }] },
        sprites: {},
        typeIds: [2],
        moveIds: [10],
      },
    ];
    const offTypeDataset: PokemonDataset = {
      pokemon: offTypeRecords,
      pokemonById: new Map(offTypeRecords.map((record) => [record.id, record])),
      movesById: new Map([
        [10, { id: 10, name: 'move-one', names: [], power: 50, typeId: 1 }],
        [11, { id: 11, name: 'move-two', names: [], power: 40, typeId: 2 }],
      ]),
      typesById: new Map([
        [1, { id: 1, name: 'fire', names: [] }],
        [2, { id: 2, name: 'water', names: [] }],
      ]),
    } as unknown as PokemonDataset;

    vi.mocked(getPokemonDataset).mockResolvedValueOnce(offTypeDataset);

    // Attacker (fire) knows move-two, a water move -> no STAB.
    const matchup = await generateMatchup(1);
    expect(matchup.stabEligible).toBe(false);
  });
});
