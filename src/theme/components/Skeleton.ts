import { defineRecipe, defineStyle } from '@chakra-ui/react';

const quiz = defineStyle({
  borderRadius: 'md',
  borderWidth: '1px',
  borderColor: 'border.500',
  background: 'background.300',
  animation: 'pulse',
  animationDuration: 'var(--duration, 1.2s)',
  _dark: {
    borderColor: 'border.100',
    background: 'background.700',
  },
});

export const Skeleton = defineRecipe({
  variants: { variant: { quiz } },
});
