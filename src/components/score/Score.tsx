import React from 'react';
import { HStack, Stat, type StatRootProps } from '@chakra-ui/react';

import { useLocalization } from '@/hooks';
import { useScore } from '@/stores';

export function Score(props: StatRootProps) {
  const score = useScore();
  const { getText } = useLocalization();

  return (
    <Stat.Root {...props}>
      <HStack color="font.800" _dark={{ color: 'font.100' }}>
        <Stat.Label data-testid="score-label">{getText('score.label')}</Stat.Label>
        <Stat.ValueText data-testid="score-value">{score}</Stat.ValueText>
      </HStack>
    </Stat.Root>
  );
}
