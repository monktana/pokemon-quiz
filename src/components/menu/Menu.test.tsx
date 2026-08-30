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

  it('defaults to simple difficulty, with the STAB option hidden since it is expert-only', () => {
    render(<Menu />);

    expect(screen.getByTestId('difficulty-simple-button')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('difficulty-expert-button')).toHaveAttribute('aria-pressed', 'false');
    expect(screen.queryByTestId('difficulty-stab-checkbox')).not.toBeInTheDocument();
  });

  it('reveals STAB questions only after switching to expert difficulty, and toggles them on click', () => {
    render(<Menu />);

    fireEvent.click(screen.getByTestId('difficulty-expert-button'));
    expect(screen.getByTestId('difficulty-expert-button')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('difficulty-simple-button')).toHaveAttribute('aria-pressed', 'false');

    expect(screen.getByTestId('difficulty-stab-checkbox')).not.toBeChecked();
    fireEvent.click(screen.getByTestId('difficulty-stab-checkbox'));
    expect(screen.getByTestId('difficulty-stab-checkbox')).toBeChecked();

    fireEvent.click(screen.getByTestId('difficulty-simple-button'));
    expect(screen.queryByTestId('difficulty-stab-checkbox')).not.toBeInTheDocument();
  });
});
