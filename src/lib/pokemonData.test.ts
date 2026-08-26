import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const pokemonPayload = [{ id: 1, name: 'fakemon-one' }];
const movesPayload = [{ id: 10, name: 'move-one' }];
const typesPayload = [{ id: 1, name: 'fire' }];

const jsonFor = (filename: string) => {
  if (filename === 'pokemon.json') return pokemonPayload;
  if (filename === 'moves.json') return movesPayload;
  if (filename === 'types.json') return typesPayload;
  throw new Error(`unexpected data file requested: ${filename}`);
};

describe('pokemonData', () => {
  beforeEach(() => {
    // getPokemonDataset caches its promise at module scope, so each test
    // needs a fresh module instance to exercise loadDataset again.
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches and hydrates the three data files into a dataset', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) => {
        const filename = url.split('/').pop()!;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(jsonFor(filename)),
        });
      })
    );

    const { getPokemonDataset } = await import('@/lib/pokemonData');
    const dataset = await getPokemonDataset();

    expect(dataset.pokemon).toEqual(pokemonPayload);
    expect(dataset.pokemonById.get(1)).toEqual(pokemonPayload[0]);
    expect(dataset.movesById.get(10)).toEqual(movesPayload[0]);
    expect(dataset.typesById.get(1)).toEqual(typesPayload[0]);
  });

  it('reuses the in-flight/cached promise instead of refetching', async () => {
    const fetchMock = vi.fn((url: string) => {
      const filename = url.split('/').pop()!;
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(jsonFor(filename)),
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const { getPokemonDataset } = await import('@/lib/pokemonData');
    await getPokemonDataset();
    await getPokemonDataset();

    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('throws when a data file fails to load', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 404,
          json: () => Promise.resolve(null),
        })
      )
    );

    const { getPokemonDataset } = await import('@/lib/pokemonData');

    await expect(getPokemonDataset()).rejects.toThrow(/Failed to load .*: 404/);
  });
});
