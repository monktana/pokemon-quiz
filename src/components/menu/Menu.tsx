import React from 'react';

import { useResetTeam } from '@/api';
import { Button, Pokeball } from '@/components';
import { useLocalization } from '@/hooks';
import { useAppStateActions, useScoreActions } from '@/stores';

export function Menu() {
  const { startQuiz } = useAppStateActions();
  const { reset } = useScoreActions();
  const { getText } = useLocalization();

  const startGame = () => {
    reset();
    useResetTeam();
    startQuiz();
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <Pokeball data-testid="pokeball" size="lg" className="animate-pokeball" />
      <div className="flex items-center justify-center">
        <Button data-testid="start-game-button" size="lg" className="mt-8" onClick={startGame}>
          {getText('mainmenu.button.newgame')}
        </Button>
      </div>
    </div>
  );
}
