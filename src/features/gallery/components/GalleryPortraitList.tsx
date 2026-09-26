import { ScrollView, StyleSheet } from 'react-native';

import { GalleryPortraitCard } from '@/components/GalleryPortraitCard';
import { layout, spacing } from '@/theme';
import type { GalleryPost } from '@/types/models';

import type { PostFeed } from '../navigation';

type GalleryPortraitListProps = {
  posts: GalleryPost[];
  /** 作品詳細で前後にスライドするときの並び */
  feed?: PostFeed;
};

/** 縦長の作品カードを横スクロールで並べる */
export function GalleryPortraitList({ posts, feed }: GalleryPortraitListProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content}>
      {posts.map((post) => (
        <GalleryPortraitCard key={post.id} post={post} feed={feed} style={styles.card} />
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
