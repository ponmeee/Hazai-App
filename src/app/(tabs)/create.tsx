import { Redirect } from 'expo-router';

/**
 * タブバー中央のプラスボタンの枠を確保するためのルート。
 * ボタンはメニューを開くだけで画面遷移しないため、URL で直接開かれた場合はホームへ戻す。
 */
export default function CreatePlaceholder() {
  return <Redirect href="/" />;
}
