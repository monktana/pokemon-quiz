import { renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useEffect } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Pokemon } from '@/api/schema';
import { Battle, type BattleProps } from '@/components';
import { queryClient, render } from '@/lib';
import { useAppState, useAppStateActions, useDifficultyActions } from '@/stores';

// Real integration test through the actual useMatchup/usePrefetchMatchup/
// useTeam/useGuess hooks - only the pure data-generation function is
// stubbed, matching the api/queries test convention.
const { teamMemberOne, teamMemberTwo, spritelessAttacker, generateMatchupMock } = vi.hoisted(() => {
  const teamMemberOne: Pokemon = {
    id: 1,
    name: 'team-one',
    species: { id: 1, name: 'team-one', names: [{ name: 'Team One', language: 'en' }] },
    types: [{ id: 1, name: 'fire', names: [{ name: 'Fire', language: 'en' }] }],
    sprites: { front_default: 'team1-front.png', back_default: 'team1-back.png' },
  };
  const teamMemberTwo: Pokemon = {
    id: 2,
    name: 'team-two',
    species: { id: 2, name: 'team-two', names: [{ name: 'Team Two', language: 'en' }] },
    types: [{ id: 2, name: 'water', names: [{ name: 'Water', language: 'en' }] }],
    sprites: { front_default: 'team2-front.png', back_default: 'team2-back.png' },
  };
  const enemy: Pokemon = {
    id: 99,
    name: 'enemy',
    species: { id: 99, name: 'enemy', names: [{ name: 'Enemy Mon', language: 'en' }] },
    types: [{ id: 3, name: 'grass', names: [{ name: 'Grass', language: 'en' }] }],
    sprites: { front_default: 'enemy-front.png' },
  };
  // No sprites at all, to exercise the `?? ''` fallback on both PokemonSprite srcs.
  const spritelessAttacker: Pokemon = {
    id: 3,
    name: 'spriteless',
    species: { id: 3, name: 'spriteless', names: [{ name: 'Spriteless', language: 'en' }] },
    types: [{ id: 4, name: 'fire', names: [{ name: 'Fire', language: 'en' }] }],
    sprites: {},
  };
  const spritelessDefender: Pokemon = { ...spritelessAttacker, id: 4, name: 'spriteless-enemy' };
  const move = {
    id: 500,
    name: 'tackle',
    names: [{ name: 'Tackle', language: 'en' }],
    power: 40,
    type: { id: 10, name: 'normal', names: [{ name: 'Normal', language: 'en' }] },
  };

  const matchupFor = (attackerId: number) => {
    if (attackerId === spritelessAttacker.id) {
      return {
        attacker: spritelessAttacker,
        defender: spritelessDefender,
        move,
        effectiveness: 'SuperEffective' as const,
        multiplier: 2,
        stabEligible: true,
      };
    }
    return {
      attacker: [teamMemberOne, teamMemberTwo].find((pokemon) => pokemon.id === attackerId)!,
      defender: enemy,
      move,
      // Constant across rounds/attackers: 'super-effective-button' /
      // 'multiplier-2-button' / 'stab-yes-button' are always the correct
      // guess, everything else is always wrong.
      effectiveness: 'SuperEffective' as const,
      multiplier: 2,
      stabEligible: true,
    };
  };

  const generateMatchupMock = vi.fn((attackerId: number) =>
    Promise.resolve(matchupFor(attackerId))
  );

  return { teamMemberOne, teamMemberTwo, spritelessAttacker, generateMatchupMock };
});

vi.mock('@/lib/generateMatchup', async () => {
  const actual =
    await vi.importActual<typeof import('@/lib/generateMatchup')>('@/lib/generateMatchup');
  return { ...actual, generateMatchup: generateMatchupMock };
});

afterEach(async () => {
  await queryClient.cancelQueries();
  queryClient.clear();
  const { result } = renderHook(() => useAppStateActions());
  result.current.openMenu();
});

describe('<Battle />', () => {
  it('renders the current matchup and all four answer buttons', async () => {
    render(<Battle team={[teamMemberOne, teamMemberTwo]} />);

    expect(await screen.findByTestId('defender-name')).toHaveTextContent('Enemy Mon');
    expect(screen.getByTestId('attacker-name')).toHaveTextContent('Team One');
    expect(screen.getByTestId('no-effect-button')).toBeEnabled();
    expect(screen.getByTestId('not-effective-button')).toBeEnabled();
    expect(screen.getByTestId('effective-button')).toBeEnabled();
    expect(screen.getByTestId('super-effective-button')).toBeEnabled();
  });

  it('increases the score and advances the round on a correct guess', async () => {
    // Above the switch chance threshold, so this exercises the no-switch path.
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const user = userEvent.setup();
    render(<Battle team={[teamMemberOne, teamMemberTwo]} />);
    await screen.findByTestId('defender-name');

    await user.click(screen.getByTestId('super-effective-button'));

    expect(screen.getByTestId('score-value')).toHaveTextContent('1');

    await waitFor(
      () => expect(queryClient.getQueryData(['matchup', 2, teamMemberOne.id])).toBeDefined(),
      { timeout: 3000 }
    );
    await waitFor(() => expect(screen.getByTestId('super-effective-button')).toBeEnabled(), {
      timeout: 3000,
    });
    // A correct guess that misses the switch chance doesn't switch the
    // active team member.
    expect(screen.getByTestId('attacker-name')).toHaveTextContent('Team One');

    randomSpy.mockRestore();
  }, 8000);

  it('switches to a random teammate with a transition message when a correct guess hits the switch chance', async () => {
    // Below the switch chance threshold, and randomItem's
    // Math.floor(0 * length) = 0 picks the first eligible (non-active) id.
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);
    const user = userEvent.setup();
    render(<Battle team={[teamMemberOne, teamMemberTwo]} />);
    await screen.findByTestId('defender-name');

    await user.click(screen.getByTestId('super-effective-button'));

    expect(screen.getByTestId('score-value')).toHaveTextContent('1');
    expect(await screen.findByTestId('switch-message')).toHaveTextContent('Team Two');
    expect(screen.getByTestId('super-effective-button')).toBeDisabled();

    await waitFor(() => expect(screen.getByTestId('attacker-name')).toHaveTextContent('Team Two'), {
      timeout: 3000,
    });
    // The outgoing member is not fainted - it's a voluntary switch.
    expect(screen.getAllByTestId('team-pokeball')[0]).toHaveAttribute('data-status', 'ok');
    await waitFor(() => expect(screen.getByTestId('super-effective-button')).toBeEnabled(), {
      timeout: 3000,
    });

    randomSpy.mockRestore();
  }, 8000);

  it('faints the active member and switches to the next on a wrong guess', async () => {
    const user = userEvent.setup();
    render(<Battle team={[teamMemberOne, teamMemberTwo]} />);
    await screen.findByTestId('defender-name');

    await user.click(screen.getByTestId('effective-button'));

    const faintedMessage = screen.getByTestId('fainted-message').textContent;
    expect(faintedMessage).toContain('Team One');
    expect(faintedMessage).toContain('fainted');
    expect(screen.getByTestId('no-effect-button')).toBeDisabled();

    await waitFor(
      () => expect(screen.getAllByTestId('team-pokeball')[0]).toHaveAttribute('data-status', 'ko'),
      { timeout: 3000 }
    );

    await waitFor(() => expect(screen.getByTestId('attacker-name')).toHaveTextContent('Team Two'), {
      timeout: 3000,
    });
    await waitFor(() => expect(screen.getByTestId('no-effect-button')).toBeEnabled(), {
      timeout: 3000,
    });
  }, 8000);

  it('falls back to an empty sprite src when a Pokemon has no sprites', async () => {
    render(<Battle team={[spritelessAttacker]} />);

    // React drops an empty-string src rather than rendering it literally, so
    // the fallback shows up as a missing attribute instead of `src=""`.
    expect(await screen.findByTestId('defender-sprite')).not.toHaveAttribute('src');
    expect(screen.getByTestId('attacker-sprite')).not.toHaveAttribute('src');
  });

  it('ends the quiz once the last team member faints', async () => {
    const user = userEvent.setup();
    render(<Battle team={[teamMemberOne]} />);
    await screen.findByTestId('defender-name');

    await user.click(screen.getByTestId('effective-button'));

    const { result } = renderHook(() => useAppState());
    await waitFor(() => expect(result.current).toEqual('gameover'), { timeout: 3000 });
  }, 8000);

  it('renders precise multiplier buttons and scores a correct guess in expert mode', async () => {
    function ExpertBattle(props: BattleProps) {
      const { setMode } = useDifficultyActions();
      useEffect(() => setMode('expert'), [setMode]);
      return <Battle {...props} />;
    }

    const user = userEvent.setup();
    render(<ExpertBattle team={[teamMemberOne, teamMemberTwo]} />);

    expect(await screen.findByTestId('defender-name')).toHaveTextContent('Enemy Mon');
    expect(screen.getByTestId('multiplier-0-button')).toBeEnabled();
    expect(screen.getByTestId('multiplier-0.25-button')).toBeEnabled();
    expect(screen.getByTestId('multiplier-0.5-button')).toBeEnabled();
    expect(screen.getByTestId('multiplier-1-button')).toBeEnabled();
    expect(screen.getByTestId('multiplier-2-button')).toBeEnabled();
    expect(screen.getByTestId('multiplier-4-button')).toBeEnabled();

    await user.click(screen.getByTestId('multiplier-2-button'));

    expect(screen.getByTestId('score-value')).toHaveTextContent('1');
  });

  it('asks a STAB question with Yes/No buttons when STAB questions are enabled in expert mode', async () => {
    function StabBattle(props: BattleProps) {
      const { setMode, setIncludeStab } = useDifficultyActions();
      useEffect(() => {
        setMode('expert');
        setIncludeStab(true);
      }, [setMode, setIncludeStab]);
      return <Battle {...props} />;
    }
    // Force the round's chance roll into the STAB branch.
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);

    const user = userEvent.setup();
    render(<StabBattle team={[teamMemberOne, teamMemberTwo]} />);

    expect(await screen.findByTestId('stab-prompt')).toBeVisible();
    expect(screen.getByTestId('stab-yes-button')).toBeEnabled();
    expect(screen.getByTestId('stab-no-button')).toBeEnabled();

    await user.click(screen.getByTestId('stab-yes-button'));

    expect(screen.getByTestId('score-value')).toHaveTextContent('1');

    randomSpy.mockRestore();
  });

  it('never asks a STAB question outside expert mode, even when STAB questions are enabled', async () => {
    function StabSimpleBattle(props: BattleProps) {
      const { setIncludeStab } = useDifficultyActions();
      useEffect(() => setIncludeStab(true), [setIncludeStab]);
      return <Battle {...props} />;
    }
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);

    render(<StabSimpleBattle team={[teamMemberOne, teamMemberTwo]} />);

    await screen.findByTestId('defender-name');
    expect(screen.queryByTestId('stab-prompt')).not.toBeInTheDocument();
    expect(screen.getByTestId('effective-button')).toBeEnabled();

    randomSpy.mockRestore();
  });

  it('highlights the correct answer button when a wrong guess is made', async () => {
    const user = userEvent.setup();
    render(<Battle team={[teamMemberOne, teamMemberTwo]} />);
    await screen.findByTestId('defender-name');

    await user.click(screen.getByTestId('effective-button'));

    expect(screen.getByTestId('effective-button')).toHaveClass('bg-feedback-incorrect');
    expect(screen.getByTestId('super-effective-button')).toHaveClass('bg-feedback-correct');
  });

  it('explains the per-type effectiveness breakdown in simple mode on a wrong guess', async () => {
    const user = userEvent.setup();
    render(<Battle team={[teamMemberOne, teamMemberTwo]} />);
    await screen.findByTestId('defender-name');

    await user.click(screen.getByTestId('effective-button'));

    // Move is normal-type against a single grass-type defender - the real
    // typeMatrix (not the mocked matchup) says that's neutral ("Effective"),
    // independent of whatever the mocked matchup claims the bucket answer is.
    const explanation = await screen.findByTestId('effectiveness-explanation');
    expect(explanation).toHaveTextContent('Normal');
    expect(explanation).toHaveTextContent('Grass');
    expect(explanation).toHaveTextContent('Effective');
  });

  it('does not show a type-effectiveness explanation in expert mode', async () => {
    function ExpertBattle(props: BattleProps) {
      const { setMode } = useDifficultyActions();
      useEffect(() => setMode('expert'), [setMode]);
      return <Battle {...props} />;
    }
    const user = userEvent.setup();
    render(<ExpertBattle team={[teamMemberOne, teamMemberTwo]} />);
    await screen.findByTestId('defender-name');

    await user.click(screen.getByTestId('multiplier-0-button'));

    expect(await screen.findByTestId('fainted-message')).toBeVisible();
    expect(screen.queryByTestId('effectiveness-explanation')).not.toBeInTheDocument();
  });
});
