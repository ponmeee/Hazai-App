import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, layout, radius, spacing, typography } from '@/theme';
import type { UserProfile } from '@/types/models';
import { formatNumber } from '@/utils/format';

type ProfileStatsProps = {
  user: UserProfile;
};

/** フォロワー・フォロー中は押すと一覧を開く */
export function ProfileStats({ user }: ProfileStatsProps) {
  const stats: { label: string; value: number; href?: Href }[] = [
    {
      label: 'フォロワー',
      value: user.followerCount,
      href: { pathname: '/users/[id]/followers', params: { id: user.id } },
    },
    {
      label: 'フォロー中',
      value: user.followingCount,
      href: { pathname: '/users/[id]/following', params: { id: user.id } },
    },
    { label: 'いいね', value: user.likeCount },
  ];

  return (
    <View style={styles.container}>
      {stats.map((stat, index) => {
        const { href } = stat;
        return (
          <Pressable
            key={stat.label}
            onPress={href === undefined ? undefined : () => router.push(href)}
            disabled={href === undefined}
            accessibilityRole={href === undefined ? undefined : 'button'}
            accessibilityLabel={`${stat.label} ${stat.value}`}
            style={({ pressed }) => [styles.stat, index > 0 && styles.statDivider, pressed && styles.pressed]}
          >
            <Text style={styles.value}>{formatNumber(stat.value)}</Text>
            <Text style={styles.label}>{stat.label}</Text>
          </Pressable>
        );
      })}
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
  pressed: {
    opacity: 0.6,
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
