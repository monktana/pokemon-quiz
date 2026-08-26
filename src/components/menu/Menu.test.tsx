import { screen } from '@testing-library/react';
import React from 'react';
import { describe, expect } from 'vitest';

import { Menu } from '@/components';
import { render } from '@/lib';
import { geti18nText } from '@/util';

describe('<Menu />', () => {
  it('displays the start game button', () => {
    render(<Menu />);

    expect(screen.getByTestId('start-game-button')).toBeVisible();
    expect(screen.getByTestId('start-game-button')).toBeEnabled();
    expect(screen.getByTestId('start-game-button')).toHaveTextContent(
      geti18nText('en', 'mainmenu.button.newgame')
    );
  });

  it('displays the Pokeball', () => {
    render(<Menu />);

    expect(screen.getByTestId('pokeball')).toBeVisible();
  });
});
