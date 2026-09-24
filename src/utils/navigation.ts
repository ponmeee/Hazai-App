import { router, type Href } from 'expo-router';

/** Web で URL を直接開いた場合など、戻る履歴がないときは fallback へ移動する */
export const goBackOr = (fallback: Href): void => {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(fallback);
  }
};
