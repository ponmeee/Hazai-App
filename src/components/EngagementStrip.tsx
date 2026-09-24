import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fontWeights, radius, spacing, typography } from '@/theme';
import { formatNumber } from '@/utils/format';

import type { IoniconName } from './IconButton';

type EngagementStripProps = {
  likeCount: number;
  commentCount: number;
  /** 表示中のユーザーがいいね済みか */
  liked?: boolean;
  size?: 'regular' | 'compact';
};

const iconSizes = { regular: 14, compact: 12 } as const;

/** 写真の上に置く、いいね数とコメント数の白いピル */
export function EngagementStrip({ likeCount, commentCount, liked = false, size = 'regular' }: EngagementStripProps) {
  const stats: { icon: IoniconName; value: number; color: string }[] = [
    { icon: liked ? 'heart' : 'heart-outline', value: likeCount, color: liked ? colors.like : colors.textPrimary },
    { icon: 'chatbubble-outline', value: commentCount, color: colors.textPrimary },
  ];

  return (
    <View style={[styles.strip, size === 'compact' && styles.stripCompact]}>
      {stats.map((stat) => (
        <View key={stat.icon} style={styles.stat}>
          <Ionicons name={stat.icon} size={iconSizes[size]} color={stat.color} />
          <Text style={[styles.value, size === 'compact' && styles.valueCompact]}>{formatNumber(stat.value)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + spacing.xxs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.glass,
  },
  stripCompact: {
    paddingVertical: spacing.sm,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  value: {
    ...typography.caption,
    ...fontWeights.semiBold,
    color: colors.textPrimary,
  },
  valueCompact: {
    ...typography.captionSmall,
    ...fontWeights.semiBold,
  },
});
