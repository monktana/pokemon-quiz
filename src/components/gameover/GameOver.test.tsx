import { fireEvent, renderHook, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { useResetTeam } from '@/api';
import { GameOver } from '@/components';
import { render } from '@/lib';
import { useAppState, useScoreActions } from '@/stores';
import { geti18nText } from '@/util';

vi.mock('@/api', async () => {
  const actual = await vi.importActual<typeof import('@/api')>('@/api');
  return { ...actual, useResetTeam: vi.fn() };
});

// Renders alongside GameOver so the seed button shares its Score context
// (a per-tree Provider, unlike the appState store which is a global
// singleton readable from any independent renderHook).
const WithSeededScore = () => {
  const { increase } = useScoreActions();
  return (
    <>
      <button data-testid="seed-score" onClick={increase} />
      <GameOver />
    </>
  );
};

describe('<GameOver />', () => {
  it('displays the game over text', () => {
    render(<GameOver />);

    expect(screen.getByText(geti18nText('en', 'gameover.text.blackout'))).toBeVisible();
  });

  it('displays the final score', () => {
    render(<GameOver />);

    expect(screen.getByText(`${geti18nText('en', 'gameover.text.score')} 0`)).toBeVisible();
  });

  it('shows a button to start a new game', () => {
    render(<GameOver />);

    expect(screen.getByTestId('new-game-button')).toBeVisible();
    expect(screen.getByTestId('new-game-button')).toBeEnabled();
    expect(screen.getByTestId('new-game-button')).toHaveTextContent(
      geti18nText('en', 'gameover.button.newgame')
    );
  });

  it('shows a button to return to the main menu', () => {
    render(<GameOver />);

    expect(screen.getByTestId('main-menu-button')).toBeVisible();
    expect(screen.getByTestId('main-menu-button')).toBeEnabled();
    expect(screen.getByTestId('main-menu-button')).toHaveTextContent(
      geti18nText('en', 'gameover.button.mainmenu')
    );
  });

  it('resets the score, resets the team, and starts a new quiz on new game', () => {
    render(<WithSeededScore />);
    fireEvent.click(screen.getByTestId('seed-score'));
    expect(
      screen.getByText(`${geti18nText('en', 'gameover.text.score')} 1`)
    ).toBeVisible();

    fireEvent.click(screen.getByTestId('new-game-button'));

    expect(
      screen.getByText(`${geti18nText('en', 'gameover.text.score')} 0`)
    ).toBeVisible();
    expect(useResetTeam).toHaveBeenCalled();

    const { result } = renderHook(() => useAppState());
    expect(result.current).toEqual('quiz');
  });

  it('resets the score and returns to the main menu on main menu', () => {
    render(<WithSeededScore />);
    fireEvent.click(screen.getByTestId('seed-score'));
    fireEvent.click(screen.getByTestId('seed-score'));
    expect(
      screen.getByText(`${geti18nText('en', 'gameover.text.score')} 2`)
    ).toBeVisible();

    fireEvent.click(screen.getByTestId('main-menu-button'));

    expect(
      screen.getByText(`${geti18nText('en', 'gameover.text.score')} 0`)
    ).toBeVisible();

    const { result } = renderHook(() => useAppState());
    expect(result.current).toEqual('menu');
  });
});
