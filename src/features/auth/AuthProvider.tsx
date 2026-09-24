import { useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { ApiError, setAuthToken, setUnauthorizedHandler } from '@/api/client';
import { queryKeys } from '@/api/queryKeys';
import type { Account } from '@/types/models';

import * as authApi from './api';
import { tokenStorage } from './tokenStorage';

type AuthState =
  | { status: 'loading'; account: null }
  | { status: 'signedOut'; account: null }
  | { status: 'signedIn'; account: Account };

type AuthContextValue = AuthState & {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: authApi.RegisterInput) => Promise<void>;
  signOut: () => Promise<void>;
  setAccount: (account: Account) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const signedOut: AuthState = { status: 'signedOut', account: null };

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<AuthState>({ status: 'loading', account: null });

  // 別のアカウントのデータが残らないよう、本人に固有のキャッシュはセッションが変わるたびに捨てる
  const resetViewerCache = useCallback(
    () => queryClient.removeQueries({ queryKey: queryKeys.viewer.all }),
    [queryClient],
  );

  const clearSession = useCallback(async () => {
    setAuthToken(null);
    await tokenStorage.remove();
    resetViewerCache();
    setState(signedOut);
  }, [resetViewerCache]);

  const startSession = useCallback(
    async ({ token, account }: authApi.AuthSession) => {
      setAuthToken(token);
      await tokenStorage.set(token);
      resetViewerCache();
      setState({ status: 'signedIn', account });
    },
    [resetViewerCache],
  );

  useEffect(() => {
    setUnauthorizedHandler(() => void clearSession());
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  useEffect(() => {
    const restoreSession = async () => {
      const token = await tokenStorage.get();
      if (token === null) {
        setState(signedOut);
        return;
      }
      setAuthToken(token);
      try {
        setState({ status: 'signedIn', account: await authApi.fetchAccount() });
      } catch (error) {
        // サーバーに繋がらないだけならトークンは残し、次回起動時に復元を再試行する
        if (error instanceof ApiError && error.status === 401) {
          await clearSession();
        } else {
          setAuthToken(null);
          setState(signedOut);
        }
      }
    };
    void restoreSession();
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      signIn: async (email, password) => startSession(await authApi.login(email, password)),
      signUp: async (input) => startSession(await authApi.register(input)),
      signOut: async () => {
        try {
          await authApi.logout();
        } finally {
          await clearSession();
        }
      },
      setAccount: (account) => setState({ status: 'signedIn', account }),
    }),
    [state, startSession, clearSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === null) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
