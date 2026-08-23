import React, { Suspense } from 'react';
import * as Sentry from '@sentry/react';
import { useQueryErrorResetBoundary } from '@tanstack/react-query';

import { Error, Game, GameOver, Loading, Menu, Navbar } from '@/components';
import { useAppState } from '@/stores';

export const App = () => {
  const { reset } = useQueryErrorResetBoundary();

  const appState = useAppState();

  return (
    <Sentry.ErrorBoundary
      onReset={reset}
      fallback={({ resetError }) => <Error reset={resetError} />}
    >
      <Suspense fallback={<Loading />}>
        <Navbar />
        <div className="mx-auto flex h-screen max-w-3xl items-center justify-center px-4">
          {appState === 'menu' && <Menu />}
          {appState === 'quiz' && <Game />}
          {appState === 'gameover' && <GameOver />}
        </div>
      </Suspense>
    </Sentry.ErrorBoundary>
  );
};
