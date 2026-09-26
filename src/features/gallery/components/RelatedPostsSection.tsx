import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, layout, spacing, typography } from '@/theme';

import { usePostsRelatedToProduct } from '../hooks';
import { GalleryPortraitList } from './GalleryPortraitList';

/** 出品と同じ端材・同じハッシュタグの端材を使った作品。なければ何も表示しない */
type RelatedPostsSectionProps = {
  productId: string;
  style?: StyleProp<ViewStyle>;
};

export function RelatedPostsSection({ productId, style }: RelatedPostsSectionProps) {
  const { data: posts } = usePostsRelatedToProduct(productId);
  if (posts === undefined || posts.length === 0) return null;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.heading}>
        <Text style={styles.title}>似た端材からつくられた作品</Text>
        <Text style={styles.hint}>同じハッシュタグの端材を使った作品です</Text>
      </View>
      <GalleryPortraitList posts={posts} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  heading: {
    gap: spacing.xxs,
    paddingHorizontal: layout.screenPaddingX,
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
  },
  hint: {
    ...typography.caption,
    color: colors.textTertiary,
  },
});
