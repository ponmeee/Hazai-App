export const colors = {
  background: '#FFFFFF',
  backdrop: '#EFEDE8',
  surface: '#F7F6F3',
  surfaceMuted: '#EFEDE8',
  border: '#E6E3DD',
  borderStrong: '#C7C7CC',
  divider: '#F0EEEA',

  textPrimary: '#1F1D1A',
  textSecondary: '#6B665E',
  textTertiary: '#A19C93',
  textOnDark: '#FFFFFF',
  textOnDarkMuted: 'rgba(255, 255, 255, 0.8)',

  accent: '#385237',
  accentPressed: '#2B402A',
  accentSoft: '#EAF0E8',

  like: '#C8574D',
  danger: '#B5483A',
  success: '#5E7A55',

  overlay: 'rgba(20, 17, 13, 0.35)',
  overlayStrong: 'rgba(28, 25, 23, 0.5)',
  overlayDark: 'rgba(42, 37, 33, 0.9)',
  /** 写真の上に文字を載せるためのグラデーション（透明 → 暗） */
  scrimClear: 'rgba(0, 0, 0, 0)',
  scrim: 'rgba(0, 0, 0, 0.7)',
  /** 写真の上に置く白いピル */
  glass: 'rgba(255, 255, 255, 0.9)',
  glassBorder: 'rgba(255, 255, 255, 0.5)',
} as const;

export type ColorName = keyof typeof colors;
