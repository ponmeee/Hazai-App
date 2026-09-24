import { router } from 'expo-router';
import { useState } from 'react';
import { Platform } from 'react-native';

import { Header } from '@/components/Header';
import { LoadingState } from '@/components/LoadingState';
import { Screen } from '@/components/Screen';
import { SuccessState } from '@/components/SuccessState';
import { useAuth } from '@/features/auth/AuthProvider';
import { SignInPrompt } from '@/features/auth/components/SignInPrompt';

/** 確認リンクが期限切れなどの場合、Supabase は URL の # 以降に error_description を付けて戻す */
const readLinkError = (): string | null => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.hash.replace(/^#/, '') || window.location.search);
  return params.get('error_description') ?? params.get('error');
};

/**
 * 確認メールのリンクから戻ってくる画面。
 * トークンの読み取りとログインは Supabase クライアント（detectSessionInUrl）が行うため、ここでは結果を表示するだけ。
 */
export default function AuthCallbackScreen() {
  const { status } = useAuth();
  const [linkError] = useState(readLinkError);

  return (
    <Screen edges={['top', 'bottom']}>
      <Header title="メールアドレスの確認" />
      {status === 'loading' && <LoadingState />}
      {status === 'signedIn' && (
        <SuccessState
          title="メールアドレスを確認しました"
          description="登録が完了しました。はざい箱をお楽しみください。"
          primaryAction={{ label: 'マイページへ', onPress: () => router.replace('/mypage') }}
          secondaryAction={{ label: 'ホームへ', onPress: () => router.replace('/') }}
        />
      )}
      {status === 'signedOut' && (
        <SignInPrompt
          title="確認できませんでした"
          description={
            linkError === null
              ? 'リンクの有効期限が切れているか、すでに使用されています。ログインしてお試しください。'
              : `リンクの有効期限が切れているか、無効です（${linkError}）。ログインしてお試しください。`
          }
        />
      )}
    </Screen>
  );
}
