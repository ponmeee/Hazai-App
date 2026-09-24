import { StyleSheet, Text, View } from 'react-native';

import { colors, fontWeights, radius, spacing, typography } from '@/theme';

type PhotoCounterBadgeProps = {
  index: number;
  total: number;
};

/** 複数枚の写真のうち何枚目を表示しているか（例: 1/4） */
export function PhotoCounterBadge({ index, total }: PhotoCounterBadgeProps) {
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>
        {Math.min(index + 1, total)}/{total}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.xs,
    backgroundColor: colors.overlayDark,
  },
  text: {
    ...typography.captionSmall,
    ...fontWeights.semiBold,
    color: colors.textOnDark,
  },
});
