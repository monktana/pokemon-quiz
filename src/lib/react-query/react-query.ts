import { DefaultOptions, QueryClient } from '@tanstack/react-query';

declare module '@tanstack/react-query' {
  interface Register {
    defaultError: Error;
  }
}

const queryConfig: DefaultOptions = {
  queries: {
    refetchOnWindowFocus: false,
    retry: false,
  },
};

export const queryClient = new QueryClient({ defaultOptions: queryConfig });
