import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import type { GalleryPostView } from '@/features/gallery/queries';
import { colors, radius, spacing, typography } from '@/theme';
import { formatNumber } from '@/utils/format';

import { CategoryTag } from './CategoryTag';
import { UserAvatar } from './UserAvatar';

type GalleryPostTileProps = {
  post: GalleryPostView;
  style?: StyleProp<ViewStyle>;
};

/** カテゴリ詳細やマイページで使う、ギャラリー投稿のコンパクト表示 */
export function GalleryPostTile({ post, style }: GalleryPostTileProps) {
  return (
    <View style={[styles.container, style]}>
      <View>
        <Image source={{ uri: post.imageUrl }} contentFit="cover" transition={200} style={styles.image} />
        <View style={styles.tagOverlay}>
          <CategoryTag label={post.categoryName} />
        </View>
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {post.title}
      </Text>
      <View style={styles.metaRow}>
        <View style={styles.author}>
          <UserAvatar uri={post.author.avatarUrl} size={20} name={post.author.name} />
          <Text style={styles.authorName} numberOfLines={1}>
            {post.author.name}
          </Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="heart-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.statText}>{formatNumber(post.likeCount)}</Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="chatbubble-outline" size={13} color={colors.textSecondary} />
          <Text style={styles.statText}>{formatNumber(post.commentCount)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  image: {
    width: '100%',
    aspectRatio: 4 / 5,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  tagOverlay: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
  },
  title: {
    ...typography.label,
    color: colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  author: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  authorName: {
    ...typography.caption,
    flexShrink: 1,
    color: colors.textSecondary,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  statText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
