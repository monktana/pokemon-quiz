import React from 'react';

import { useCancelMatchup, usePrefetchMatchup } from '@/api';
import { Button } from '@/components';
import { useLocalization } from '@/hooks';
import { useAppStateActions, useScore, useScoreActions } from '@/stores';

export function GameOver() {
  const { startQuiz, openMenu } = useAppStateActions();
  const score = useScore();
  const { reset } = useScoreActions();
  const { getText } = useLocalization();

  useCancelMatchup();
  usePrefetchMatchup(1);

  return (
    <div className="flex flex-col items-center gap-2">
      <p data-testid="gameover-message" className="text-foreground my-1 text-2xl">
        {getText('gameover.text.blackout')}
      </p>
      <p data-testid="final-score" className="text-muted-foreground my-2 text-sm">
        {getText('gameover.text.score')} {score}
      </p>
      <div className="mt-8 flex flex-col items-center gap-4">
        <Button
          data-testid="new-game-button"
          size="lg"
          variant="primary"
          className="w-full"
          onClick={() => {
            reset();
            startQuiz();
          }}
        >
          {getText('gameover.button.newgame').toUpperCase()}
        </Button>
        <Button
          data-testid="main-menu-button"
          size="lg"
          variant="primary"
          className="w-full"
          onClick={() => {
            reset();
            openMenu();
          }}
        >
          {getText('gameover.button.mainmenu').toUpperCase()}
        </Button>
      </div>
    </div>
  );
}
