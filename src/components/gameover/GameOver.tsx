import React from 'react';

import { useCancelMatchup, useResetTeam } from '@/api';
import { Button } from '@/components';
import { useLocalization } from '@/hooks';
import { useAppStateActions, useScore, useScoreActions } from '@/stores';

export function GameOver() {
  const { startQuiz, openMenu } = useAppStateActions();
  const score = useScore();
  const { reset } = useScoreActions();
  const { getText } = useLocalization();

  useCancelMatchup();

  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <p
        data-testid="gameover-message"
        className="text-foreground my-1 text-3xl leading-[1.1] font-bold tracking-[-0.012em] text-balance"
      >
        {getText('gameover.text.blackout')}
      </p>
      <p
        data-testid="final-score"
        className="text-muted-foreground my-2 text-sm tracking-[0.02em] tabular-nums"
      >
        {getText('gameover.text.score')} {score}
      </p>
      <div className="mt-8 flex w-64 flex-col items-center gap-4">
        <Button
          data-testid="new-game-button"
          size="lg"
          variant="primary"
          className="w-full"
          onClick={() => {
            reset();
            useResetTeam();
            startQuiz();
          }}
        >
          {getText('gameover.button.newgame')}
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
          {getText('gameover.button.mainmenu')}
        </Button>
      </div>
    </div>
  );
}
