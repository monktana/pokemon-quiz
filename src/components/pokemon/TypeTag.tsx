import React from 'react';
import { Tag, type TagRootProps } from '@chakra-ui/react';

import { InternationalName } from '@/api';
import { TypeIcon, types } from '@/components';
import { getResourceName } from '@/components/pokemon/util';
import { useLanguage } from '@/stores';

export interface TypeTagProps extends TagRootProps {
  type: types;
  text: InternationalName[];
}

export const TypeTag = ({ type, text, ...tagProps }: TypeTagProps) => {
  const language = useLanguage();
  return (
    <Tag.Root data-testid={`${type}-type-tag`} colorPalette={type} {...tagProps}>
      <Tag.StartElement>
        <TypeIcon type={type} />
      </Tag.StartElement>
      <Tag.Label>{getResourceName(text, language)}</Tag.Label>
    </Tag.Root>
  );
};
