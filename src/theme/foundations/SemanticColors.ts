import { defineSemanticTokens } from '@chakra-ui/react';

import { colorPaletteNames } from '@/theme/foundations/Colors';

// Derives colorPalette semantic slots (solid/fg/subtle/...) for every pokemon
// type color, following the same shade formula Chakra uses for its own palettes.
export const semanticColors = defineSemanticTokens.colors(
  Object.fromEntries(
    colorPaletteNames.map((name) => [
      name,
      {
        contrast: { value: { _light: 'white', _dark: 'white' } },
        fg: { value: { _light: `{colors.${name}.700}`, _dark: `{colors.${name}.300}` } },
        subtle: { value: { _light: `{colors.${name}.100}`, _dark: `{colors.${name}.900}` } },
        muted: { value: { _light: `{colors.${name}.200}`, _dark: `{colors.${name}.800}` } },
        emphasized: { value: { _light: `{colors.${name}.300}`, _dark: `{colors.${name}.700}` } },
        solid: { value: { _light: `{colors.${name}.600}`, _dark: `{colors.${name}.600}` } },
        focusRing: { value: { _light: `{colors.${name}.500}`, _dark: `{colors.${name}.500}` } },
      },
    ])
  )
);
