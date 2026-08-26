import React from 'react';
import { Skeleton } from '@/components';

export const Loading = () => {
  return (
    <div className="flex h-screen items-center justify-center">
      <div
        data-testid="loading-container"
        className="bg-bezel border-bezel-border w-90 rounded-lg border-2 p-3 sm:p-4"
      >
        <div className="bg-canvas flex w-full flex-col gap-4 rounded-md p-2 sm:p-3">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-38 w-full rounded-lg" />
          <Skeleton className="h-38 w-full rounded-lg" />
          <Skeleton className="h-12 w-full" />
          <div className="grid w-full grid-cols-2 gap-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
