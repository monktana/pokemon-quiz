import { Languages } from '../../src/util/localization/i18n';
import type {
  PokeApiMove,
  PokeApiName,
  PokeApiPokemon,
  PokeApiSpecies,
  PokeApiType,
} from './pokeapi';
import type { InternationalName, MoveRecord, PokemonRecord, TypeRecord } from './types';

// Only keep names for languages the app actually renders (see getResourceName) -
// PokeAPI ships a dozen+ languages per resource that would otherwise bloat the
// dataset for no benefit.
export const toInternationalNames = (names: PokeApiName[]): InternationalName[] =>
  names
    .filter((name) => (Languages as readonly string[]).includes(name.language.name))
    .map((name) => ({ name: name.name, language: name.language.name }));

export const isAttackingMove = (move: PokeApiMove): boolean =>
  move.power !== null && move.power > 0;

export const toTypeRecord = (type: PokeApiType): TypeRecord => ({
  id: type.id,
  name: type.name,
  names: toInternationalNames(type.names),
});

export const toMoveRecord = (move: PokeApiMove, typeId: number): MoveRecord => ({
  id: move.id,
  name: move.name,
  names: toInternationalNames(move.names),
  power: move.power!,
  typeId,
});

export const toPokemonRecord = (
  pokemon: PokeApiPokemon,
  species: PokeApiSpecies,
  typeIds: number[],
  moveIds: number[]
): PokemonRecord => ({
  id: pokemon.id,
  name: pokemon.name,
  species: {
    id: species.id,
    names: toInternationalNames(species.names),
  },
  sprites: {
    front_default: pokemon.sprites.front_default,
    front_shiny: pokemon.sprites.front_shiny,
    front_female: pokemon.sprites.front_female,
    front_shiny_female: pokemon.sprites.front_shiny_female,
    back_default: pokemon.sprites.back_default,
    back_shiny: pokemon.sprites.back_shiny,
    back_female: pokemon.sprites.back_female,
    back_shiny_female: pokemon.sprites.back_shiny_female,
  },
  typeIds,
  moveIds,
});
