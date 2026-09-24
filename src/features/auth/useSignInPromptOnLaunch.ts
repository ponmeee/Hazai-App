import { router, usePathname } from 'expo-router';
import { useEffect } from 'react';

import { useAuth } from './AuthProvider';

// 起動（Web ではページの読み込み）ごとに 1 回だけ判定する。× で閉じた後にタブを移動しても再び出さない
let hasCheckedThisLaunch = false;

/**
 * 未ログインでホームを開いたとき、ホームの上にログイン画面を重ねて表示する。
 * 商品ページなどを URL で直接開いた場合は、見たい画面を妨げないよう表示しない。
 */
export function useSignInPromptOnLaunch(): void {
  const { status } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (hasCheckedThisLaunch || status === 'loading') return;
    hasCheckedThisLaunch = true;
    if (status === 'signedOut' && pathname === '/') router.push('/login');
  }, [status, pathname]);
}
