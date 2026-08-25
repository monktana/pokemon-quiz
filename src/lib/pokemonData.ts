import { InternationalName, Move, Pokemon, PokemonSprites, Type } from '@/api/schema';

type TypeRecord = {
  id: number;
  name: string;
  names: InternationalName[];
};

type MoveRecord = {
  id: number;
  name: string;
  names: InternationalName[];
  power: number;
  typeId: number;
};

type PokemonRecord = {
  id: number;
  name: string;
  species: {
    id: number;
    names: InternationalName[];
  };
  sprites: PokemonSprites;
  typeIds: number[];
  /** IDs into movesById. Only attacking moves (power > 0) are ever included, see generate.ts. */
  moveIds: number[];
};

export type PokemonDataset = {
  pokemon: PokemonRecord[];
  pokemonById: Map<number, PokemonRecord>;
  movesById: Map<number, MoveRecord>;
  typesById: Map<number, TypeRecord>;
};

const fetchDataFile = async <T>(filename: string): Promise<T> => {
  const response = await fetch(`/data/${filename}`);
  if (!response.ok) {
    throw new Error(`Failed to load /data/${filename}: ${response.status}`);
  }
  return response.json() as Promise<T>;
};

let datasetPromise: Promise<PokemonDataset> | null = null;

const loadDataset = async (): Promise<PokemonDataset> => {
  const [pokemon, moves, types] = await Promise.all([
    fetchDataFile<PokemonRecord[]>('pokemon.json'),
    fetchDataFile<MoveRecord[]>('moves.json'),
    fetchDataFile<TypeRecord[]>('types.json'),
  ]);

  return {
    pokemon,
    pokemonById: new Map(pokemon.map((record) => [record.id, record])),
    movesById: new Map(moves.map((move) => [move.id, move])),
    typesById: new Map(types.map((type) => [type.id, type])),
  };
};

export const getPokemonDataset = (): Promise<PokemonDataset> => {
  if (!datasetPromise) {
    datasetPromise = loadDataset();
  }
  return datasetPromise;
};

export const hydrateType = (dataset: PokemonDataset, typeId: number): Type => {
  const record = dataset.typesById.get(typeId)!;
  return { id: record.id, name: record.name, names: record.names };
};

export const hydrateMove = (dataset: PokemonDataset, moveId: number): Move => {
  const record = dataset.movesById.get(moveId)!;
  return {
    id: record.id,
    name: record.name,
    names: record.names,
    power: record.power,
    type: hydrateType(dataset, record.typeId),
  };
};

export const hydratePokemon = (dataset: PokemonDataset, record: PokemonRecord): Pokemon => ({
  id: record.id,
  name: record.name,
  species: { id: record.species.id, name: record.name, names: record.species.names },
  sprites: record.sprites,
  types: record.typeIds.map((typeId) => hydrateType(dataset, typeId)),
  // Intentionally omitted: no component ever reads Pokemon.moves (only the
  // separately-selected Matchup.move), so it's never generated or hydrated.
  moves: undefined,
});
