import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';

import { getCategoryName } from '@/features/categories/queries';
import { usePostLike } from '@/features/gallery/hooks';
import { postDetailHref, type PostFeed } from '@/features/gallery/navigation';
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
  /** 作品詳細（コメント）画面へのリンクにするか。詳細画面の中では false */
  linkToDetail?: boolean;
  /** 作品詳細で前後にスライドするときの並び（開いた元の一覧の条件） */
  feed?: PostFeed;
  onLikeError?: (error: unknown) => void;
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
export function GalleryPostCard({ post, linkToDetail = true, feed, onLikeError }: GalleryPostCardProps) {
  const like = usePostLike(post.id);
  const [photoIndex, setPhotoIndex] = useState(0);
  const photoCount = post.imageUrls.length;

  const openDetail = () => router.push(postDetailHref(post.id, feed));

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
          <Pressable
            onPress={() => router.push({ pathname: '/users/[id]', params: { id: post.author.id } })}
            accessibilityRole="link"
            accessibilityLabel={`${post.author.name}のプロフィール`}
            style={({ pressed }) => [styles.author, pressed && styles.pressed]}
          >
            <PostAuthorMeta author={post.author} appearance="glass" />
          </Pressable>
          <View style={styles.passThrough}>
            <EngagementStrip likeCount={post.likeCount} commentCount={post.commentCount} liked={like.isLiked} />
          </View>
        </View>
      </View>

      <View style={styles.body}>
        <Pressable
          onPress={linkToDetail ? openDetail : undefined}
          disabled={!linkToDetail}
          accessibilityRole={linkToDetail ? 'link' : undefined}
          accessibilityLabel={linkToDetail ? `${post.title}の詳細とコメント` : undefined}
          style={styles.text}
        >
          <Text style={styles.title} numberOfLines={linkToDetail ? 2 : undefined}>
            {post.title}
          </Text>
          {post.body !== '' && (
            <Text style={styles.description} numberOfLines={linkToDetail ? 3 : undefined}>
              {post.body}
            </Text>
          )}
        </Pressable>
        <View style={styles.footer}>
          <Text style={styles.time}>{formatRelativeTime(post.createdAt)}</Text>
          <View style={styles.actions}>
            <CircleAction
              icon={like.isLiked ? 'heart' : 'heart-outline'}
              color={like.isLiked ? colors.like : colors.textPrimary}
              accessibilityLabel={like.isLiked ? 'いいねを取り消す' : 'いいね'}
              onPress={() => like.toggle(onLikeError)}
            />
            <CircleAction
              icon="chatbubble-outline"
              accessibilityLabel="コメント"
              onPress={linkToDetail ? openDetail : undefined}
            />
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
    // 投稿者の表示だけを押せるようにし、それ以外は写真のスライド操作を下へ通す
    pointerEvents: 'box-none',
  },
  author: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  passThrough: {
    pointerEvents: 'none',
  },
  body: {
    gap: spacing.md,
    padding: spacing.xl,
  },
  text: {
    gap: spacing.md,
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
