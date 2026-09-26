import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { getCategoryName } from '@/features/categories/queries';
import { postDetailHref, type PostFeed } from '@/features/gallery/navigation';
import { colors, radius, spacing } from '@/theme';
import type { GalleryPost } from '@/types/models';

import { CategoryTag } from './CategoryTag';
import { EngagementStrip } from './EngagementStrip';
import { PhotoScrim } from './PhotoScrim';
import { PostAuthorMeta } from './PostAuthorMeta';

type GalleryPortraitCardProps = {
  post: GalleryPost;
  style?: StyleProp<ViewStyle>;
  /** 作品詳細で前後にスライドするときの並び（開いた元の一覧の条件） */
  feed?: PostFeed;
};

/** 写真を全面に敷いた縦長の作品カード。横スクロールの一覧で使う */
export function GalleryPortraitCard({ post, style, feed }: GalleryPortraitCardProps) {
  return (
    <Link href={postDetailHref(post.id, feed)} asChild>
      <Pressable accessibilityLabel={`${post.title}の詳細`} style={style}>
        {({ pressed }) => (
          <View style={[styles.container, pressed && styles.pressed]}>
            <Image
              source={{ uri: post.imageUrl }}
              accessibilityLabel={post.title}
              contentFit="cover"
              transition={200}
              style={StyleSheet.absoluteFill}
            />
            <PhotoScrim />

            <View style={styles.topOverlay}>
              <CategoryTag label={getCategoryName(post.categorySlug)} />
            </View>

            <View style={styles.bottomOverlay}>
              <PostAuthorMeta author={post.author} size="compact" appearance="onScrim" />
              <EngagementStrip likeCount={post.likeCount} commentCount={post.commentCount} size="compact" />
            </View>
          </View>
        )}
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    aspectRatio: 9 / 16,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  pressed: {
    opacity: 0.85,
  },
  topOverlay: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
  },
  bottomOverlay: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    gap: spacing.sm,
  },
});
