import { StyleSheet, Text, View } from 'react-native';

import { colors, fontWeights, radius, spacing, typography } from '@/theme';

type CategoryTagProps = {
  label: string;
  /** overlay: 画像の上に重ねる / muted: 白背景の上に置く */
  tone?: 'overlay' | 'muted';
};

export function CategoryTag({ label, tone = 'overlay' }: CategoryTagProps) {
  return (
    <View style={[styles.tag, tone === 'overlay' ? styles.overlay : styles.muted]}>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.full,
  },
  overlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
  },
  muted: {
    backgroundColor: colors.accentSoft,
  },
  label: {
    ...typography.caption,
    ...fontWeights.semiBold,
    color: colors.textPrimary,
  },
});
