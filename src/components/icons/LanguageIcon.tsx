import React, { SVGProps } from 'react';

import { Language } from '@/util';

import { DEIcon } from './DE';
import { ESIcon } from './ES';
import { FRIcon } from './FR';
import { GBIcon } from './GB';
import { ITIcon } from './IT';
import { JPIcon } from './JP';
import { KRIcon } from './KR';

export const LanguageIcon = ({ type, ...rest }: { type: Language } & SVGProps<SVGSVGElement>) => {
  switch (type) {
    case 'de':
      return <DEIcon {...rest} />;
    case 'en':
      return <GBIcon {...rest} />;
    case 'es':
      return <ESIcon {...rest} />;
    case 'fr':
      return <FRIcon {...rest} />;
    case 'it':
      return <ITIcon {...rest} />;
    case 'ja':
      return <JPIcon {...rest} />;
    case 'ko':
      return <KRIcon {...rest} />;
    default:
      console.error(`no language icon found for: ${type}`);
      break;
  }
};
