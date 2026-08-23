import { defineKeyframes } from '@chakra-ui/react';

export const keyframes = defineKeyframes({
  pokeball: {
    '0%': { transform: 'rotate(0)' },
    '10%': { transform: 'rotate(-25deg)' },
    '30%': { transform: 'rotate(17deg)' },
    '60%': { transform: 'rotate(-10deg)' },
    '80%': { transform: 'rotate(5deg)' },
    '90%': { transform: 'rotate(0)' },
    '100%': { transform: 'rotate(0)' },
  },
});
