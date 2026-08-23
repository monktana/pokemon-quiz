import React from 'react';
import { Skeleton } from '@/components';

export const Loading = () => {
  return (
    <div className="flex h-screen items-center justify-center">
      <div data-testid="loading-container" className="flex w-90 flex-col gap-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-54.5 w-full" />
        <Skeleton className="h-54.5 w-full" />
        <Skeleton className="h-12 w-full" />
        <div className="bg-background-200 dark:bg-background-800 grid w-full grid-cols-2 gap-2 rounded-md p-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
};
