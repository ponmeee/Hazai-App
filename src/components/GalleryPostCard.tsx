import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';

import { getCategoryName } from '@/features/categories/queries';
import { colors, layout, radius, spacing, typography } from '@/theme';
import type { GalleryPost } from '@/types/models';
import { formatNumber } from '@/utils/format';

import { CategoryTag } from './CategoryTag';
import { IconButton, type IoniconName } from './IconButton';
import { UserAvatar } from './UserAvatar';

type GalleryPostCardProps = {
  post: GalleryPost;
};

type CountActionProps = {
  icon: IoniconName;
  count: number;
  color?: string;
  accessibilityLabel: string;
  onPress?: () => void;
};

function CountAction({ icon, count, color = colors.textPrimary, accessibilityLabel, onPress }: CountActionProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={6}
      style={({ pressed }) => [styles.countAction, pressed && styles.pressed]}
    >
      <Ionicons name={icon} size={22} color={color} />
      <Text style={styles.countText}>{formatNumber(count)}</Text>
    </Pressable>
  );
}

export function GalleryPostCard({ post }: GalleryPostCardProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  const sharePost = async () => {
    try {
      await Share.share({ message: `${post.title} - ${post.author.name} | はざい箱` });
    } catch {
      // 共有シートを閉じた場合や Web で Share API が使えない場合は何もしない
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.authorRow}>
        <UserAvatar uri={post.author.avatarUrl} size={36} name={post.author.name} />
        <View style={styles.authorText}>
          <Text style={styles.authorName}>{post.author.name}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={12} color={colors.textTertiary} />
            <Text style={styles.location}>{post.author.location}</Text>
          </View>
        </View>
      </View>

      <View>
        <Image source={{ uri: post.imageUrl }} contentFit="cover" transition={200} style={styles.image} />
        <View style={styles.tagOverlay}>
          <CategoryTag label={getCategoryName(post.categorySlug)} />
        </View>
      </View>

      <View style={styles.actionRow}>
        <CountAction
          icon={liked ? 'heart' : 'heart-outline'}
          color={liked ? colors.like : colors.textPrimary}
          count={post.likeCount + (liked ? 1 : 0)}
          accessibilityLabel={liked ? 'いいねを取り消す' : 'いいね'}
          onPress={() => setLiked((value) => !value)}
        />
        <CountAction icon="chatbubble-outline" count={post.commentCount} accessibilityLabel="コメント" />
        <View style={styles.spacer} />
        <IconButton
          icon={saved ? 'bookmark' : 'bookmark-outline'}
          accessibilityLabel={saved ? '保存を取り消す' : '保存'}
          size={22}
          onPress={() => setSaved((value) => !value)}
        />
        <IconButton icon="paper-plane-outline" accessibilityLabel="シェア" size={22} onPress={sharePost} />
      </View>

      <View style={styles.textBlock}>
        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.body} numberOfLines={2}>
          {post.body}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    paddingHorizontal: layout.screenPaddingX,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  authorText: {
    gap: spacing.xxs,
  },
  authorName: {
    ...typography.label,
    color: colors.textPrimary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  location: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  image: {
    width: '100%',
    aspectRatio: 4 / 5,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  tagOverlay: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  countAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 36,
  },
  pressed: {
    opacity: 0.5,
  },
  countText: {
    ...typography.label,
    color: colors.textPrimary,
  },
  spacer: {
    flex: 1,
  },
  textBlock: {
    gap: spacing.xs,
  },
  title: {
    ...typography.subheading,
    color: colors.textPrimary,
  },
  body: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});
