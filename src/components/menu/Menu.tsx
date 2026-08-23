import React from 'react';

import { usePrefetchMatchup } from '@/api';
import { Button } from '@/components';
import { useLocalization } from '@/hooks';
import { useAppStateActions, useScoreActions } from '@/stores';

export function Menu() {
  const { startQuiz } = useAppStateActions();
  const { reset } = useScoreActions();
  const { getText } = useLocalization();

  usePrefetchMatchup(1);

  const startGame = () => {
    reset();
    startQuiz();
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        data-testid="pokeball"
        className="animate-pokeball relative h-80 w-80 rounded-full border-[6px] border-black [background:linear-gradient(var(--color-red-500)_0%,var(--color-red-500)_50%,white_50%)]"
      >
        <div className="absolute top-1/2 left-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-[6px] border-black bg-white" />
      </div>
      <div className="flex items-center justify-center">
        <Button data-testid="start-game-button" size="lg" className="mt-8" onClick={startGame}>
          {getText('mainmenu.button.newgame').toUpperCase()}
        </Button>
      </div>
    </div>
  );
}
