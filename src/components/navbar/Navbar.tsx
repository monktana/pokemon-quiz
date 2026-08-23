import React from 'react';
import { Box, HStack, IconButton } from '@chakra-ui/react';

import { LanguageMenu, TypeIcon } from '@/components';
import { useLocalization } from '@/hooks';
import { useColorMode, useColorModeValue } from '@/providers/ColorModeProvider';

export function Navbar() {
  const { getText } = useLocalization();
  const { toggleColorMode } = useColorMode();

  const iconName = useColorModeValue('dark', 'psychic');

  return (
    <Box
      position="fixed"
      zIndex="overlay"
      width="full"
      backgroundColor="background.100"
      _dark={{ backgroundColor: 'background.900' }}
    >
      <HStack align="center" justify="end" paddingY={2} paddingX={4} gap={2}>
        <LanguageMenu />
        <IconButton
          data-testid="color-mode-switch"
          aria-label={getText('navbar.color.label')}
          variant="solid"
          colorPalette={iconName}
          onClick={toggleColorMode}
        >
          <TypeIcon type={iconName} color="current" />
        </IconButton>
      </HStack>
    </Box>
  );
}
