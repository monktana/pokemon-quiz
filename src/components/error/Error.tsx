import React from 'react';

import { Button } from '@/components';
import { useLocalization } from '@/hooks';

import { GhostIcon } from '../icons';

type ErrorProps = {
  reset: () => void;
};

export const Error = ({ reset }: ErrorProps) => {
  const { getText } = useLocalization();

  return (
    <div className="mx-auto h-screen max-w-3xl px-4">
      <div className="flex h-full flex-col items-center justify-center">
        <GhostIcon className="mb-4 h-12 w-12" />
        <h2
          data-testid="error-header"
          className="mb-2 text-2xl leading-[1.1] font-bold tracking-[-0.012em]"
        >
          {getText('error.title')}
        </h2>
        <p data-testid="error-message" className="text-muted-foreground text-center text-sm">
          {getText('error.info')}
        </p>
        <Button data-testid="reset-button" variant="primary" className="mt-8" onClick={reset}>
          {getText('error.button')}
        </Button>
      </div>
    </div>
  );
};
