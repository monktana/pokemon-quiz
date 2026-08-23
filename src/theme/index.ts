import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

import { Button, Skeleton } from '@/theme/components';
import { colors, keyframes, semanticColors } from '@/theme/foundations';

import { globalCss } from './styles';

const config = defineConfig({
  globalCss,
  theme: {
    tokens: {
      colors,
    },
    semanticTokens: {
      colors: semanticColors,
    },
    keyframes,
    recipes: {
      button: Button,
      skeleton: Skeleton,
    },
  },
});

export const system = createSystem(defaultConfig, config);
