import type { Session } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { queryKeys } from '@/api/queryKeys';
import type { PickedImage } from '@/features/uploads/pickImages';
import { isSupabaseConfigured, supabase } from '@/lib/supabase/client';
import type { Account } from '@/types/models';

import * as authApi from './api';
import { clearPendingAvatar, savePendingAvatar, takePendingAvatar } from './pendingAvatar';

type AuthState =
  | { status: 'loading'; account: null }
  | { status: 'signedOut'; account: null }
  | { status: 'signedIn'; account: Account };

type AuthContextValue = AuthState & {
  signIn: (email: string, password: string) => Promise<void>;
  /** avatar は登録後の最初のログインでアップロードする（メール確認前は Storage に書き込めないため） */
  signUp: (input: authApi.RegisterInput, avatar?: PickedImage) => Promise<authApi.SignUpResult>;
  signOut: () => Promise<void>;
  setAccount: (account: Account) => void;
  /** フォロー数など、サーバー側で変わった自分の情報を読み直す */
  refreshAccount: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const signedOut: AuthState = { status: 'signedOut', account: null };

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<AuthState>(
    isSupabaseConfigured ? { status: 'loading', account: null } : signedOut,
  );
  // トークン更新のたびにプロフィールを読み直さないよう、読み込み済みのユーザーを覚えておく
  const loadedUserIdRef = useRef<string | null>(null);

  const uploadPendingAvatar = useCallback(async (account: Account) => {
    const image = await takePendingAvatar(account.email);
    if (image === null) return;
    try {
      const updated = await authApi.updateAvatar(image);
      if (loadedUserIdRef.current === updated.id) setState({ status: 'signedIn', account: updated });
    } catch {
      // 失敗してもログイン自体は続ける。写真はプロフィール編集から設定し直せる
    }
  }, []);

  const applySession = useCallback(
    async (session: Session | null) => {
      const userId = session?.user.id ?? null;
      if (userId === loadedUserIdRef.current && userId !== null) return;

      // 別のアカウントのデータが残らないよう、本人に固有のキャッシュはユーザーが変わるたびに捨てる
      queryClient.removeQueries({ queryKey: queryKeys.viewer.all });
      loadedUserIdRef.current = userId;

      if (session === null) {
        setState(signedOut);
        return;
      }
      try {
        const account = await authApi.fetchAccount(session.user);
        setState({ status: 'signedIn', account });
        void uploadPendingAvatar(account);
      } catch {
        // 次のセッション通知で読み直せるよう、読み込み済みの印を外す
        loadedUserIdRef.current = null;
        setState(signedOut);
      }
    },
    [queryClient, uploadPendingAvatar],
  );

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    // 初回は保存済みセッション（INITIAL_SESSION）が通知される。
    // コールバック内で Supabase の他の API を待つとデッドロックするため、処理は次のタスクへ回す
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => void applySession(session), 0);
    });
    return () => data.subscription.unsubscribe();
  }, [applySession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      signIn: async (email, password) => applySession(await authApi.signIn(email, password)),
      signUp: async (input, avatar) => {
        if (avatar !== undefined) await savePendingAvatar(input.email, avatar);
        try {
          const result = await authApi.signUp(input);
          if (result.session !== null) await applySession(result.session);
          return result;
        } catch (error) {
          if (avatar !== undefined) await clearPendingAvatar();
          throw error;
        }
      },
      signOut: async () => {
        try {
          await authApi.signOut();
        } finally {
          await applySession(null);
        }
      },
      setAccount: (account) => setState({ status: 'signedIn', account }),
      refreshAccount: async () => {
        if (state.status !== 'signedIn') return;
        const account = await authApi.fetchAccount(state.account);
        if (loadedUserIdRef.current === account.id) setState({ status: 'signedIn', account });
      },
    }),
    [state, applySession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === null) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
