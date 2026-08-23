import React from 'react';
import { Box, Button, Center, VStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';

import { usePrefetchMatchup } from '@/api';
import { useLocalization } from '@/hooks';
import { useAppStateActions, useScoreActions } from '@/stores';

const animation = 'pokeball 4s ease-in-out infinite';

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
    <VStack gap={2}>
      <Box
        data-testid="pokeball"
        as={motion.div}
        animation={animation}
        position="relative"
        width="xs"
        height="xs"
        rounded="full"
        borderWidth="6px"
        borderColor="black"
        background="linear-gradient(var(--chakra-colors-red-500) 0%, var(--chakra-colors-red-500) 50%, white 50%)"
      >
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform={'translate(-50%, -50%)'}
          width="4rem"
          height="4rem"
          bg="white"
          rounded="full"
          borderWidth="6px"
          borderColor="black"
        />
      </Box>
      <Center>
        <Button data-testid="start-game-button" size="lg" marginTop={8} onClick={startGame}>
          {getText('mainmenu.button.newgame').toUpperCase()}
        </Button>
      </Center>
    </VStack>
  );
}
