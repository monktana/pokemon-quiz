/**
 * Data contract for the client-side game logic (see src/lib/generateMatchup.ts).
 * Was previously generated from the now-removed C# backend's Swagger schema;
 * hand-authored now, kept field-for-field identical so nothing downstream
 * had to change.
 */

export interface InternationalName {
  name?: string | null;
  language?: string | null;
}

export interface Matchup {
  attacker?: Pokemon;
  defender?: Pokemon;
  move?: Move;
  effectiveness?: TypeEffectiveness;
}

export interface Move {
  /** @format int32 */
  id?: number;
  name?: string | null;
  names?: InternationalName[] | null;
  /** @format int32 */
  power?: number | null;
  type?: Type;
}

export interface Pokemon {
  /** @format int32 */
  id?: number;
  name?: string | null;
  moves?: Move[] | null;
  sprites?: PokemonSprites;
  species?: PokemonSpecies;
  types?: Type[] | null;
}

export interface PokemonSpecies {
  /** @format int32 */
  id?: number;
  name?: string | null;
  names?: InternationalName[] | null;
}

export interface PokemonSprites {
  front_default?: string | null;
  front_shiny?: string | null;
  front_female?: string | null;
  front_shiny_female?: string | null;
  back_default?: string | null;
  back_shiny?: string | null;
  back_female?: string | null;
  back_shiny_female?: string | null;
}

export interface Type {
  /** @format int32 */
  id?: number;
  name?: string | null;
  names?: InternationalName[] | null;
}

export enum TypeEffectiveness {
  NoEffect = 'NoEffect',
  NotVeryEffective = 'NotVeryEffective',
  Effective = 'Effective',
  SuperEffective = 'SuperEffective',
}
