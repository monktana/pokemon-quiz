import React from 'react';

import { useResetTeam } from '@/api';
import { Button, buttonVariants, Pokeball } from '@/components';
import { useLocalization } from '@/hooks';
import {
  useAppStateActions,
  useDifficultyActions,
  useDifficultyMode,
  useIncludeStab,
  useScoreActions,
} from '@/stores';

export function Menu() {
  const { startQuiz } = useAppStateActions();
  const { reset } = useScoreActions();
  const { getText } = useLocalization();
  const mode = useDifficultyMode();
  const includeStab = useIncludeStab();
  const { setMode, setIncludeStab } = useDifficultyActions();

  const startGame = () => {
    reset();
    useResetTeam();
    startQuiz();
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <Pokeball data-testid="pokeball" size="lg" className="animate-pokeball" />

      <div data-testid="difficulty-mode" className="mt-6 grid grid-cols-2 gap-2">
        <button
          type="button"
          data-testid="difficulty-simple-button"
          aria-pressed={mode === 'simple'}
          onClick={() => setMode('simple')}
          className={buttonVariants({ variant: mode === 'simple' ? 'primary' : 'default' })}
        >
          {getText('mainmenu.difficulty.simple')}
        </button>
        <button
          type="button"
          data-testid="difficulty-expert-button"
          aria-pressed={mode === 'expert'}
          onClick={() => setMode('expert')}
          className={buttonVariants({ variant: mode === 'expert' ? 'primary' : 'default' })}
        >
          {getText('mainmenu.difficulty.expert')}
        </button>
      </div>

      {mode === 'expert' ? (
        <label className="text-foreground flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            data-testid="difficulty-stab-checkbox"
            checked={includeStab}
            onChange={(event) => setIncludeStab(event.target.checked)}
          />
          {getText('mainmenu.difficulty.stab')}
        </label>
      ) : null}

      <div className="flex items-center justify-center">
        <Button data-testid="start-game-button" size="lg" className="mt-8" onClick={startGame}>
          {getText('mainmenu.button.newgame')}
        </Button>
      </div>
    </div>
  );
}
