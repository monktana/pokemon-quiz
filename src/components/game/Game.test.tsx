import { screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Game } from '@/components';
import { render } from '@/lib';
import { bulbasaur } from '@/lib/testing/fixtures';

const fixtureTeam = [bulbasaur];

vi.mock('@/api', async () => {
  const actual = await vi.importActual<typeof import('@/api')>('@/api');
  return {
    ...actual,
    useTeamQuery: () => ({ data: fixtureTeam }),
    useMatchup: () => ({
      data: {
        attacker: bulbasaur,
        defender: { ...bulbasaur, id: bulbasaur.id! + 1 },
        move: bulbasaur.moves![0],
        effectiveness: 'Effective',
      },
      isFetching: false,
    }),
    usePrefetchMatchup: () => {},
  };
});

describe('<Game />', () => {
  it('passes the queried team down to Battle', () => {
    render(<Game />);

    expect(screen.getByTestId('team-status')).toBeVisible();
    expect(screen.getAllByTestId('team-pokeball')).toHaveLength(fixtureTeam.length);
  });
});
