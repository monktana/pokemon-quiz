import { render, RenderOptions } from '@testing-library/react';
import React, { ReactElement, ReactNode, Suspense } from 'react';

import { AppProvider } from '@/providers';

type WithProviderProps = {
  children?: ReactNode;
};

const WithProviders = ({ children }: WithProviderProps) => {
  return (
    <AppProvider browserLanguage="en">
      {/* Mirrors App.tsx's real tree: anything using a Suspense query
          (useTeamQuery, useMatchup) needs a boundary to render into. */}
      <Suspense fallback={null}>{children}</Suspense>
    </AppProvider>
  );
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: WithProviders, ...options });

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender as render };
