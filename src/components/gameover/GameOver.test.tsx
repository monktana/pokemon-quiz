import { screen } from '@testing-library/react';
import React from 'react';
import { describe, expect } from 'vitest';

import { GameOver } from '@/components';
import { render } from '@/lib';
import { geti18nText } from '@/util';

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
});
