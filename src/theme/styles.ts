import { defineGlobalStyles } from '@chakra-ui/react';

export const globalCss = defineGlobalStyles({
  '*, ::after, ::before': {
    boxSizing: 'border-box',
  },
  'html, body': {
    bgColor: 'background.300',
    _dark: {
      bgColor: 'background.900',
    },
  },
  img: {
    imageRendering: 'pixelated',
  },
});
