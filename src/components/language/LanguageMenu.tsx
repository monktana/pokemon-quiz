import React from 'react';
import { HStack, IconButton, Menu, Text } from '@chakra-ui/react';

import { LanguageIcon } from '@/components';
import { useLocalization } from '@/hooks';
import { useLanguage, useLanguageActions } from '@/stores';
import { Languages } from '@/util';

export const LanguageMenu = () => {
  const language = useLanguage();
  const { getText } = useLocalization();
  const { setLanguage } = useLanguageActions();

  return (
    <Menu.Root data-testid="language-menu">
      <Menu.Trigger asChild>
        <IconButton data-testid="language-switch" aria-label={getText('navbar.language.label')}>
          <LanguageIcon type={language} aria-label={language} />
        </IconButton>
      </Menu.Trigger>
      <Menu.Positioner>
        <Menu.Content
          minWidth="12rem"
          backgroundColor="background.200"
          _dark={{ backgroundColor: 'background.800' }}
        >
          <Menu.RadioItemGroup value={language}>
            {Languages.map((language) => (
              <Menu.RadioItem
                key={language}
                value={language}
                data-testid={`${language}-language`}
                backgroundColor="background.200"
                onClick={() => setLanguage(language)}
                _hover={{
                  backgroundColor: 'background.300',
                }}
                _dark={{
                  backgroundColor: 'background.800',
                  _hover: {
                    backgroundColor: 'background.700',
                  },
                }}
              >
                <HStack>
                  <LanguageIcon type={language} />
                  <Text>{getText(language)}</Text>
                </HStack>
              </Menu.RadioItem>
            ))}
          </Menu.RadioItemGroup>
        </Menu.Content>
      </Menu.Positioner>
    </Menu.Root>
  );
};
