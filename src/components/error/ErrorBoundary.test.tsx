import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { ErrorBoundary } from '@/components';

const Bomb = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) throw new Error('boom');
  return <div data-testid="safe-child" />;
};

describe('<ErrorBoundary />', () => {
  it('renders children when nothing throws', () => {
    render(
      <ErrorBoundary onReset={vi.fn()} fallback={() => <div data-testid="fallback" />}>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('safe-child')).toBeVisible();
    expect(screen.queryByTestId('fallback')).not.toBeInTheDocument();
  });

  it('renders the fallback when a child throws', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary onReset={vi.fn()} fallback={() => <div data-testid="fallback" />}>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('fallback')).toBeVisible();
    expect(screen.queryByTestId('safe-child')).not.toBeInTheDocument();

    consoleError.mockRestore();
  });

  it('calls onReset and clears the error state when resetError is invoked', () => {
    const onReset = vi.fn();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const errorBoundary = (shouldThrow: boolean) => (
      <ErrorBoundary
        onReset={onReset}
        fallback={({ resetError }) => (
          <button data-testid="reset-button" onClick={resetError}>
            reset
          </button>
        )}
      >
        <Bomb shouldThrow={shouldThrow} />
      </ErrorBoundary>
    );

    const { rerender } = render(errorBoundary(true));
    expect(screen.getByTestId('reset-button')).toBeVisible();

    // Swap in a non-throwing child first: the boundary still shows the
    // fallback (hasError only clears via resetError), but once it does,
    // this is the tree it renders into instead of throwing again.
    rerender(errorBoundary(false));
    expect(screen.getByTestId('reset-button')).toBeVisible();

    fireEvent.click(screen.getByTestId('reset-button'));

    expect(onReset).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('safe-child')).toBeVisible();

    consoleError.mockRestore();
  });
});
