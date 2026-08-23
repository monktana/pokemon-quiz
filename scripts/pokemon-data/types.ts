export type InternationalName = {
  name: string;
  language: string;
};

export type TypeRecord = {
  id: number;
  name: string;
  names: InternationalName[];
};

export type MoveRecord = {
  id: number;
  name: string;
  names: InternationalName[];
  power: number;
  typeId: number;
};

export type PokemonRecord = {
  id: number;
  name: string;
  species: {
    id: number;
    names: InternationalName[];
  };
  sprites: {
    front_default: string | null;
    front_shiny: string | null;
    front_female: string | null;
    front_shiny_female: string | null;
    back_default: string | null;
    back_shiny: string | null;
    back_female: string | null;
    back_shiny_female: string | null;
  };
  typeIds: number[];
  moveIds: number[];
};
