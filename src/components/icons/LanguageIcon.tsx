import React, { SVGProps } from 'react';
import * as Sentry from '@sentry/react';

import { Language } from '@/util';

import { DEIcon } from './DE';
import { GBIcon } from './GB';

export const LanguageIcon = ({
  type,
  ...rest
}: { type: Language } & SVGProps<SVGSVGElement>) => {
  switch (type) {
    case 'de':
      return <DEIcon {...rest} />;
    case 'en':
      return <GBIcon {...rest} />;
    default:
      Sentry.captureException(new Error(`no language icon found for: ${type}`));
      break;
  }
};
