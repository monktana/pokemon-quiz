import { screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { Pokemon } from '@/api/schema';
import { Team } from '@/components';
import { render } from '@/lib';

const makePokemon = (id: number, typeName: string): Pokemon => ({
  id,
  name: `fakemon-${id}`,
  types: [{ id, name: typeName, names: [] }],
});

const team = [makePokemon(1, 'fire'), makePokemon(2, 'water'), makePokemon(3, 'grass')];

describe('<Team />', () => {
  it('renders one pokeball per team member', () => {
    render(<Team team={team} koIds={[]} />);

    expect(screen.getAllByTestId('team-pokeball')).toHaveLength(team.length);
  });

  it('marks fainted team members as ko', () => {
    render(<Team team={team} koIds={[2]} />);

    const pokeballs = screen.getAllByTestId('team-pokeball');
    expect(pokeballs[0]).toHaveAttribute('data-status', 'ok');
    expect(pokeballs[1]).toHaveAttribute('data-status', 'ko');
    expect(pokeballs[2]).toHaveAttribute('data-status', 'ok');
  });

  it('exposes the type of the active team member only', () => {
    render(<Team team={team} koIds={[]} activeId={2} />);

    const pokeballs = screen.getAllByTestId('team-pokeball');
    expect(pokeballs[0]).not.toHaveAttribute('data-type');
    expect(pokeballs[1]).toHaveAttribute('data-type', 'water');
    expect(pokeballs[2]).not.toHaveAttribute('data-type');
  });

  it('renders no data-type when no team member is active', () => {
    render(<Team team={team} koIds={[]} />);

    screen.getAllByTestId('team-pokeball').forEach((pokeball) => {
      expect(pokeball).not.toHaveAttribute('data-type');
    });
  });
});
