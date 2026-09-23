import { StyleSheet, Text, View } from 'react-native';

import { colors, layout, radius, spacing, typography } from '@/theme';
import type { User } from '@/types/models';
import { formatNumber } from '@/utils/format';

type ProfileStatsProps = {
  user: User;
};

export function ProfileStats({ user }: ProfileStatsProps) {
  const stats = [
    { label: 'フォロワー', value: user.followerCount },
    { label: 'フォロー中', value: user.followingCount },
    { label: 'いいね', value: user.likeCount },
  ];

  return (
    <View style={styles.container}>
      {stats.map((stat, index) => (
        <View key={stat.label} style={[styles.stat, index > 0 && styles.statDivider]}>
          <Text style={styles.value}>{formatNumber(stat.value)}</Text>
          <Text style={styles.label}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: layout.screenPaddingX,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xxs,
  },
  statDivider: {
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: colors.border,
  },
  value: {
    ...typography.heading,
    color: colors.textPrimary,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
