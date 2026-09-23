export const colors = {
  background: '#FFFFFF',
  backdrop: '#EFEDE8',
  surface: '#F7F6F3',
  surfaceMuted: '#EFEDE8',
  border: '#E6E3DD',
  divider: '#F0EEEA',

  textPrimary: '#1F1D1A',
  textSecondary: '#6B665E',
  textTertiary: '#A19C93',
  textOnDark: '#FFFFFF',

  accent: '#7B6248',
  accentPressed: '#654F39',
  accentSoft: '#F3EDE5',

  like: '#C8574D',
  danger: '#B5483A',
  success: '#5E7A55',

  overlay: 'rgba(20, 17, 13, 0.35)',
} as const;

export type ColorName = keyof typeof colors;
