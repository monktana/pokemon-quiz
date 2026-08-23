const BASE_URL = 'https://pokeapi.co/api/v2';

export type PokeApiNamedResource = {
  name: string;
  url: string;
};

export type PokeApiName = {
  name: string;
  language: PokeApiNamedResource;
};

export type PokeApiSprites = {
  front_default: string | null;
  front_shiny: string | null;
  front_female: string | null;
  front_shiny_female: string | null;
  back_default: string | null;
  back_shiny: string | null;
  back_female: string | null;
  back_shiny_female: string | null;
};

export type PokeApiPokemon = {
  id: number;
  name: string;
  species: PokeApiNamedResource;
  sprites: PokeApiSprites;
  types: { slot: number; type: PokeApiNamedResource }[];
  moves: { move: PokeApiNamedResource }[];
};

export type PokeApiSpecies = {
  id: number;
  name: string;
  names: PokeApiName[];
};

export type PokeApiMove = {
  id: number;
  name: string;
  names: PokeApiName[];
  power: number | null;
  type: PokeApiNamedResource;
};

export type PokeApiType = {
  id: number;
  name: string;
  names: PokeApiName[];
};

const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`PokeAPI request failed: ${response.status} ${url}`);
  }
  return response.json() as Promise<T>;
};

export const fetchPokemon = (id: number): Promise<PokeApiPokemon> =>
  fetchJson(`${BASE_URL}/pokemon/${id}`);

export const fetchSpecies = (nameOrUrl: string): Promise<PokeApiSpecies> =>
  fetchJson(nameOrUrl.startsWith('http') ? nameOrUrl : `${BASE_URL}/pokemon-species/${nameOrUrl}`);

export const fetchMove = (nameOrUrl: string): Promise<PokeApiMove> =>
  fetchJson(nameOrUrl.startsWith('http') ? nameOrUrl : `${BASE_URL}/move/${nameOrUrl}`);

export const fetchType = (nameOrUrl: string): Promise<PokeApiType> =>
  fetchJson(nameOrUrl.startsWith('http') ? nameOrUrl : `${BASE_URL}/type/${nameOrUrl}`);
