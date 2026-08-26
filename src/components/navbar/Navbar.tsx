import React from 'react';

import { buttonVariants, LanguageMenu, TypeIcon } from '@/components';
import { useLocalization } from '@/hooks';
import { cn } from '@/lib/cn';
import { useColorMode, useColorModeValue } from '@/providers/ColorModeProvider';

export function Navbar() {
  const { getText } = useLocalization();
  const { toggleColorMode } = useColorMode();

  const iconName = useColorModeValue('dark', 'psychic');

  return (
    <div className="bg-background-100 dark:bg-background-900 fixed z-50 w-full">
      <div className="flex items-center justify-end gap-2 px-4 py-2">
        <LanguageMenu />
        <button
          data-testid="color-mode-switch"
          data-type={iconName}
          aria-label={getText('navbar.color.label')}
          onClick={toggleColorMode}
          className={cn(
            buttonVariants({ size: 'icon', variant: 'unstyled' }),
            'bg-(--type-solid) text-(--type-contrast)',
            '[@media(hover:hover)]:hover:opacity-90'
          )}
        >
          <TypeIcon type={iconName} className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
