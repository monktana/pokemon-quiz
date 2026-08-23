import React from 'react';
import { Button, Text, VStack } from '@chakra-ui/react';

import { useCancelMatchup, usePrefetchMatchup } from '@/api';
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
    <VStack gap={2}>
      <Text
        data-testid="gameover-message"
        my={1}
        fontSize="2xl"
        color="font.800"
        _dark={{ color: 'font.100' }}
      >
        {getText('gameover.text.blackout')}
      </Text>
      <Text
        data-testid="final-score"
        my={2}
        fontSize="sm"
        color="font.500"
        _dark={{ color: 'font.300' }}
      >
        {getText('gameover.text.score')} {score}
      </Text>
      <VStack gap={4} mt="8">
        <Button
          data-testid="new-game-button"
          size="lg"
          variant="primary"
          width="full"
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
          width="full"
          onClick={() => {
            reset();
            openMenu();
          }}
        >
          {getText('gameover.button.mainmenu').toUpperCase()}
        </Button>
      </VStack>
    </VStack>
  );
}
