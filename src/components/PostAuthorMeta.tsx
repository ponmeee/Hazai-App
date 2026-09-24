import { StyleSheet, Text, View } from 'react-native';

import { colors, fontWeights, radius, spacing, typography } from '@/theme';
import type { UserSummary } from '@/types/models';

import { UserAvatar } from './UserAvatar';

type PostAuthorMetaProps = {
  author: UserSummary;
  /** compact: 横スクロールの小さなカード用 */
  size?: 'regular' | 'compact';
  /**
   * plain: 白い背景の上 / onScrim: 暗いグラデーションを敷いた写真の上（白い文字）
   * glass: グラデーションのない写真の上（白いピルに入れて、どんな写真でも読めるようにする）
   */
  appearance?: 'plain' | 'onScrim' | 'glass';
};

const AVATAR_BORDER_WIDTH = 1;
const avatarSizes = { regular: 36, compact: 28 } as const;

/** 作品カードの写真の上に置く、投稿者のアイコン・名前・地域 */
export function PostAuthorMeta({ author, size = 'regular', appearance = 'plain' }: PostAuthorMetaProps) {
  const onScrim = appearance === 'onScrim';

  return (
    <View
      style={[
        styles.container,
        size === 'compact' && styles.containerCompact,
        appearance === 'glass' && styles.glass,
      ]}
    >
      <View style={styles.avatarRing}>
        <UserAvatar uri={author.avatarUrl} size={avatarSizes[size] - AVATAR_BORDER_WIDTH * 2} name={author.name} />
      </View>
      <View style={[styles.text, appearance === 'glass' && styles.textGlass]}>
        <Text
          style={[styles.name, size === 'compact' && styles.nameCompact, onScrim && styles.onScrim]}
          numberOfLines={1}
        >
          {author.name}
        </Text>
        {author.location !== '' && (
          <Text style={[styles.location, onScrim && styles.mutedOnScrim]} numberOfLines={1}>
            {author.location}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  containerCompact: {
    gap: spacing.sm,
  },
  glass: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    paddingLeft: spacing.xs,
    paddingRight: spacing.lg,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.glass,
  },
  avatarRing: {
    borderWidth: AVATAR_BORDER_WIDTH,
    borderColor: colors.glassBorder,
    borderRadius: radius.full,
  },
  text: {
    flex: 1,
    gap: spacing.xxs,
  },
  // ピルは中身の幅に合わせるため、文字の列を伸ばさない
  textGlass: {
    flexGrow: 0,
    flexShrink: 1,
    flexBasis: 'auto',
  },
  name: {
    ...typography.input,
    ...fontWeights.semiBold,
    color: colors.textPrimary,
  },
  nameCompact: {
    ...typography.caption,
    ...fontWeights.semiBold,
  },
  location: {
    ...typography.captionSmall,
    color: colors.textSecondary,
  },
  onScrim: {
    color: colors.textOnDark,
  },
  mutedOnScrim: {
    color: colors.textOnDarkMuted,
  },
});
