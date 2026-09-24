import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';

import { getCategoryName } from '@/features/categories/queries';
import { colors, layout, radius, spacing, typography } from '@/theme';
import type { GalleryPost } from '@/types/models';
import { formatRelativeTime } from '@/utils/format';

import { CategoryTag } from './CategoryTag';
import { EngagementStrip } from './EngagementStrip';
import type { IoniconName } from './IconButton';
import { PhotoCounterBadge } from './PhotoCounterBadge';
import { PhotoPager } from './PhotoPager';
import { PostAuthorMeta } from './PostAuthorMeta';

type GalleryPostCardProps = {
  post: GalleryPost;
};

type CircleActionProps = {
  icon: IoniconName;
  accessibilityLabel: string;
  color?: string;
  onPress?: () => void;
};

function CircleAction({ icon, accessibilityLabel, color = colors.textPrimary, onPress }: CircleActionProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={onPress === undefined}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={spacing.xs}
      style={({ pressed }) => [styles.circleAction, pressed && styles.pressed]}
    >
      <Ionicons name={icon} size={16} color={color} />
    </Pressable>
  );
}

/** ギャラリーの作品カード。写真が複数枚あるときは横にスライドして切り替える */
export function GalleryPostCard({ post }: GalleryPostCardProps) {
  const [liked, setLiked] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const photoCount = post.imageUrls.length;

  const sharePost = async () => {
    try {
      await Share.share({ message: `${post.title} - ${post.author.name} | はざい箱` });
    } catch {
      // 共有シートを閉じた場合や Web で Share API が使えない場合は何もしない
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.photoArea}>
        <PhotoPager uris={post.imageUrls} accessibilityLabel={post.title} onIndexChange={setPhotoIndex} />

        <View style={styles.topLeft}>
          <CategoryTag label={getCategoryName(post.categorySlug)} />
        </View>
        {photoCount > 1 && (
          <View style={styles.topRight}>
            <PhotoCounterBadge index={photoIndex} total={photoCount} />
          </View>
        )}

        <View style={styles.bottomOverlay}>
          <PostAuthorMeta author={post.author} appearance="glass" />
          <EngagementStrip
            likeCount={post.likeCount + (liked ? 1 : 0)}
            commentCount={post.commentCount}
            liked={liked}
          />
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {post.title}
        </Text>
        {post.body !== '' && (
          <Text style={styles.description} numberOfLines={3}>
            {post.body}
          </Text>
        )}
        <View style={styles.footer}>
          <Text style={styles.time}>{formatRelativeTime(post.createdAt)}</Text>
          <View style={styles.actions}>
            <CircleAction
              icon={liked ? 'heart' : 'heart-outline'}
              color={liked ? colors.like : colors.textPrimary}
              accessibilityLabel={liked ? 'いいねを取り消す' : 'いいね'}
              onPress={() => setLiked((value) => !value)}
            />
            <CircleAction icon="chatbubble-outline" accessibilityLabel="コメント" />
            <CircleAction icon="share-outline" accessibilityLabel="シェア" onPress={sharePost} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: layout.screenPaddingX,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  photoArea: {
    aspectRatio: layout.postPhotoAspectRatio,
    backgroundColor: colors.surface,
  },
  topLeft: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
  },
  topRight: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
  },
  bottomOverlay: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
    gap: spacing.md,
    // 写真のスライド操作をこの領域越しにも受け付ける
    pointerEvents: 'none',
  },
  body: {
    gap: spacing.md,
    padding: spacing.xl,
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
  },
  description: {
    ...typography.paragraph,
    color: colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  time: {
    ...typography.captionSmall,
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  circleAction: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  pressed: {
    opacity: 0.6,
  },
});
