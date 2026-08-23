import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

import { buttonVariants, LanguageIcon } from '@/components';
import { useLocalization } from '@/hooks';
import { cn } from '@/lib/cn';
import { useLanguage, useLanguageActions } from '@/stores';
import { Language, Languages } from '@/util';

export const LanguageMenu = () => {
  const language = useLanguage();
  const { getText } = useLocalization();
  const { setLanguage } = useLanguageActions();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          data-testid="language-switch"
          aria-label={getText('navbar.language.label')}
          className={cn(
            buttonVariants({ size: 'icon' }),
            'hover:bg-background-200 dark:hover:bg-background-800'
          )}
        >
          <LanguageIcon type={language} aria-label={language} className="h-5 w-5" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={4}
          className="bg-background-200 dark:bg-background-800 min-w-48 rounded-md p-1 shadow-md"
        >
          <DropdownMenu.RadioGroup
            value={language}
            onValueChange={(value) => setLanguage(value as Language)}
          >
            {Languages.map((language) => (
              <DropdownMenu.RadioItem
                key={language}
                value={language}
                data-testid={`${language}-language`}
                className="hover:bg-background-300 dark:hover:bg-background-700 flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 outline-none"
              >
                <LanguageIcon type={language} className="h-4 w-4" />
                <span>{getText(language)}</span>
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
