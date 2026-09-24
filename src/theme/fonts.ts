import { Manrope_400Regular } from '@expo-google-fonts/manrope/400Regular';
import { Manrope_600SemiBold } from '@expo-google-fonts/manrope/600SemiBold';
import { Manrope_700Bold } from '@expo-google-fonts/manrope/700Bold';
import type { TextStyle } from 'react-native';

export const fontFamilies = {
  regular: 'Manrope_400Regular',
  semiBold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
} as const;

/** useFonts に渡す読み込み対象。使う太さだけを含める */
export const fontAssets = {
  [fontFamilies.regular]: Manrope_400Regular,
  [fontFamilies.semiBold]: Manrope_600SemiBold,
  [fontFamilies.bold]: Manrope_700Bold,
};

/**
 * Manrope は欧文のみで日本語の字形を持たず、日本語はシステムフォントへフォールバックする。
 * フォールバック側も同じ太さで表示されるよう、fontFamily と fontWeight を必ず組で指定する。
 */
export const fontWeights = {
  regular: { fontFamily: fontFamilies.regular, fontWeight: '400' },
  semiBold: { fontFamily: fontFamilies.semiBold, fontWeight: '600' },
  bold: { fontFamily: fontFamilies.bold, fontWeight: '700' },
} as const satisfies Record<string, TextStyle>;
