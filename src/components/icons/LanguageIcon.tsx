import React, { SVGProps } from 'react';

import { Language } from '@/util';

import { DEIcon } from './DE';
import { GBIcon } from './GB';

export const LanguageIcon = ({ type, ...rest }: { type: Language } & SVGProps<SVGSVGElement>) => {
  switch (type) {
    case 'de':
      return <DEIcon {...rest} />;
    case 'en':
      return <GBIcon {...rest} />;
    default:
      console.error(`no language icon found for: ${type}`);
      break;
  }
};
