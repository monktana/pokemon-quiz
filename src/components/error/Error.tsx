import React from 'react';
import { Button, Container, Flex, Heading, Text } from '@chakra-ui/react';

import { useLocalization } from '@/hooks';

import { GhostIcon } from '../icons';

type ErrorProps = {
  reset: () => void;
};

export const Error = ({ reset }: ErrorProps) => {
  const { getText } = useLocalization();

  return (
    <Container height="100vh">
      <Flex flexDirection="column" height="full" alignItems="center" justifyContent="center">
        <GhostIcon width="12" height="12" marginBottom={4} />
        <Heading data-testid="error-header" as="h2" marginBottom={2} size="xl">
          {getText('error.title')}
        </Heading>
        <Text data-testid="error-message" color="font.800" _dark={{ color: 'font.100' }}>
          {getText('error.info')}
        </Text>
        <Button data-testid="reset-button" variant="primary" marginTop="8" onClick={reset}>
          {getText('error.button')}
        </Button>
      </Flex>
    </Container>
  );
};
