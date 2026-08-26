import { fireEvent, renderHook, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { useResetTeam } from '@/api';
import { Menu } from '@/components';
import { render } from '@/lib';
import { useAppState } from '@/stores';
import { geti18nText } from '@/util';

vi.mock('@/api', async () => {
  const actual = await vi.importActual<typeof import('@/api')>('@/api');
  return { ...actual, useResetTeam: vi.fn() };
});

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

  it('resets the team and starts the quiz on click', () => {
    render(<Menu />);

    fireEvent.click(screen.getByTestId('start-game-button'));

    expect(useResetTeam).toHaveBeenCalled();

    const { result } = renderHook(() => useAppState());
    expect(result.current).toEqual('quiz');
  });
});
