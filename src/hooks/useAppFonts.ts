import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { fontAssets } from '@/theme/fonts';

/**
 * expo-font は Web で太さの記述子なしに @font-face を登録するため、ブラウザが
 * 太字ファイルにさらに疑似ボールドを重ねてしまう。欧文は各太さのファイルを使うので合成は不要。
 */
function disableWebFontWeightSynthesis(): void {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.textContent = '* { font-synthesis-weight: none; }';
  document.head.appendChild(style);
}

/** フォントの準備ができたら true。読み込みに失敗した場合もシステムフォントで表示を続ける */
export function useAppFonts(): boolean {
  const [loaded, error] = useFonts(fontAssets);

  useEffect(disableWebFontWeightSynthesis, []);

  return loaded || error !== null;
}
