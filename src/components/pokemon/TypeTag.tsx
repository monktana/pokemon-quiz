import React, { HTMLAttributes } from 'react';

import { InternationalName } from '@/api';
import { TypeIcon, types } from '@/components';
import { getResourceName } from '@/components/pokemon/util';
import { cn } from '@/lib/cn';
import { useLanguage } from '@/stores';

export interface TypeTagProps extends HTMLAttributes<HTMLSpanElement> {
  type: types;
  text: InternationalName[];
}

export const TypeTag = ({ type, text, className, ...rest }: TypeTagProps) => {
  const language = useLanguage();
  return (
    <span
      data-testid={`${type}-type-tag`}
      data-type={type}
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm font-medium',
        'border-(--type-muted) bg-(--type-subtle) text-(--type-fg)',
        className
      )}
      {...rest}
    >
      <TypeIcon type={type} className="h-4 w-4" />
      <span>{getResourceName(text, language)}</span>
    </span>
  );
};
