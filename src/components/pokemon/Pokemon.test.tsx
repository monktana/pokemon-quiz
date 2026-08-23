import React from 'react';
import { screen, within } from '@testing-library/react';
import { describe, expect, it as base } from 'vitest';

import { getResourceName, PokemonName, PokemonSprite, PokemonTags, types } from '@/components';
import { bulbasaur, render } from '@/lib';
import * as TypeFixtures from '@/lib/testing/fixtures/type';

import { Pokemon } from './Pokemon';
import { TypeTag } from './TypeTag';

const it = base.extend({
  pokemon: bulbasaur,
  types: TypeFixtures,
});

describe('<Pokemon />', () => {
  it('displays the pokemon name', ({ pokemon }) => {
    render(
      <Pokemon pokemon={pokemon} className="flex-row-reverse" data-testid="attacker-pokemon">
        <PokemonSprite data-testid="attacker-sprite" src={pokemon.sprites?.back_default ?? ""} />
        <div className="text-foreground flex w-full flex-col items-start">
          <PokemonName data-testid="attacker-name" />
          <PokemonTags />
        </div>
      </Pokemon>
    );
    expect(screen.getByTestId('attacker-name')).toBeVisible();

    const { getByText } = within(screen.getByTestId('attacker-name'));
    expect(getByText(getResourceName(pokemon.species!.names!, 'en')!)).toBeInTheDocument();
  });

  it('displays the back sprite when attacking', ({ pokemon }) => {
    render(
      <Pokemon pokemon={pokemon} className="flex-row-reverse" data-testid="attacker-pokemon">
        <PokemonSprite data-testid="attacker-sprite" src={pokemon.sprites?.back_default ?? ""} />
        <div className="text-foreground flex w-full flex-col items-start">
          <PokemonName data-testid="attacker-name" />
          <PokemonTags />
        </div>
      </Pokemon>
    );

    expect(screen.getByTestId('attacker-sprite')).toBeVisible();
    expect(screen.getByTestId('attacker-sprite')).toHaveAttribute(
      'src',
      pokemon.sprites?.back_default
    );
  });

  it('displays the front sprite when defending', ({ pokemon }) => {
    render(
      <Pokemon pokemon={pokemon} className="flex-row-reverse" data-testid="defender-pokemon">
        <PokemonSprite data-testid="defender-sprite" src={pokemon.sprites?.front_default ?? ""} />
        <div className="text-foreground flex w-full flex-col items-start">
          <PokemonName data-testid="defender-name" />
          <PokemonTags />
        </div>
      </Pokemon>
    );

    expect(screen.getByTestId('defender-sprite')).toBeVisible();
    expect(screen.getByTestId('defender-sprite')).toHaveAttribute(
      'src',
      bulbasaur.sprites?.front_default
    );
  });

  it('displays the types of the pokemon', ({ pokemon }) => {
    render(
      <Pokemon pokemon={pokemon} className="flex-row-reverse" data-testid="attacker-pokemon">
        <PokemonSprite data-testid="attacker-sprite" src={pokemon.sprites?.back_default ?? ""} />
        <div className="text-foreground flex w-full flex-col items-start">
          <PokemonName data-testid="attacker-name" />
          <PokemonTags />
        </div>
      </Pokemon>
    );

    pokemon.types?.forEach((type) => {
      expect(screen.getByTestId(`${type.name}-type-tag`)).toBeVisible();
      expect(screen.getByTestId(`${type.name}-type-tag`)).toHaveTextContent(
        getResourceName(type.names!, 'en')!
      );
    });
  });
});

describe('<TypeTag />', () => {
  it('displays the information of type', ({ types }) => {
    Object.entries(types).forEach(([key, type]) => {
      render(<TypeTag type={key as types} text={type.names!} />);

      expect(screen.getByTestId(`${key}-type-tag`)).toBeVisible();
      expect(screen.getByTestId(`${key}-type-tag`)).toHaveTextContent(
        getResourceName(type.names!, 'en')!
      );
      expect(screen.getByTestId(`${key}-type-tag`)).toContainElement(
        screen.getByTestId(`${key}-type-tag`).querySelector('svg')
      );
    });
  });
});
