export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const layout = {
  screenPaddingX: spacing.lg,
  // Web ではスマホ幅の1カラムとして中央に表示する
  maxContentWidth: 520,
  // 作品カードの写真の縦横比（デザインのカード幅 362 に対して高さ 420）
  postPhotoAspectRatio: 362 / 420,
} as const;
