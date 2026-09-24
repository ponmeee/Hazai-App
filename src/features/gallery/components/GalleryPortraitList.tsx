import { ScrollView, StyleSheet } from 'react-native';

import { GalleryPortraitCard } from '@/components/GalleryPortraitCard';
import { layout, spacing } from '@/theme';
import type { GalleryPost } from '@/types/models';

type GalleryPortraitListProps = {
  posts: GalleryPost[];
};

/** 縦長の作品カードを横スクロールで並べる */
export function GalleryPortraitList({ posts }: GalleryPortraitListProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content}>
      {posts.map((post) => (
        <GalleryPortraitCard key={post.id} post={post} style={styles.card} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingHorizontal: layout.screenPaddingX,
  },
  card: {
    width: 180,
  },
});
