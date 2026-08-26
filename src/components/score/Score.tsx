import React, { HTMLAttributes } from 'react';

import { useLocalization } from '@/hooks';
import { useScore } from '@/stores';

export function Score(props: HTMLAttributes<HTMLDivElement>) {
  const score = useScore();
  const { getText } = useLocalization();

  return (
    <div {...props}>
      <div className="text-foreground flex items-center gap-2">
        <span data-testid="score-label">{getText('score.label')}</span>
        <span data-testid="score-value" className="text-xl font-bold tabular-nums normal-case">
          {score}
        </span>
      </div>
    </div>
  );
}
