import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useEffect } from 'react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useGameStore } from '../state/useGameStore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';

type AppProvidersProps = {
  children: ReactNode;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

function AuthWatcher() {
  const setPlayerId = useGameStore((state) => state.setPlayerId);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setPlayerId(user?.uid ?? null);
    });
  }, [setPlayerId]);

  return null;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthWatcher />
      {children}
      {import.meta.env.DEV ? (
        <ReactQueryDevtools initialIsOpen={false} />
      ) : null}
    </QueryClientProvider>
  );
}
