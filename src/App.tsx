import React, { Suspense } from 'react';
import { useQueryErrorResetBoundary } from '@tanstack/react-query';

import { Error, ErrorBoundary, Game, GameOver, Loading, Menu, Navbar } from '@/components';
import { useAppState } from '@/stores';

export const App = () => {
  const { reset } = useQueryErrorResetBoundary();

  const appState = useAppState();

  return (
    <ErrorBoundary onReset={reset} fallback={({ resetError }) => <Error reset={resetError} />}>
      <Suspense fallback={<Loading />}>
        <Navbar />
        <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4 pt-14">
          {appState === 'menu' && <Menu />}
          {appState === 'quiz' && <Game />}
          {appState === 'gameover' && <GameOver />}
        </div>
      </Suspense>
    </ErrorBoundary>
  );
};
