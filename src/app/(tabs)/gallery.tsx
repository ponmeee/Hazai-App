import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { CategoryChipList } from '@/components/CategoryChipList';
import { EmptyState } from '@/components/EmptyState';
import { GalleryPostCard } from '@/components/GalleryPostCard';
import { Header } from '@/components/Header';
import { Screen } from '@/components/Screen';
import { getCategories } from '@/features/categories/queries';
import { FollowingUserList } from '@/features/gallery/components/FollowingUserList';
import { getGalleryPosts } from '@/features/gallery/queries';
import { getFollowingUsers } from '@/features/users/queries';
import { colors, layout, spacing } from '@/theme';
import type { CategorySlug } from '@/types/models';

export default function GalleryScreen() {
  const [selectedCategory, setSelectedCategory] = useState<CategorySlug | null>(null);
  const posts = getGalleryPosts(selectedCategory ?? undefined);

  return (
    <Screen>
      <Header title="ギャラリー" />
      <FlatList
        data={posts}
        keyExtractor={(post) => post.id}
        renderItem={({ item }) => <GalleryPostCard post={item} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <CategoryChipList
              categories={getCategories()}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
            <FollowingUserList users={getFollowingUsers()} />
          </View>
        }
        ListEmptyComponent={<EmptyState title="このカテゴリの作品はまだありません" />}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxxl,
  },
  listHeader: {
    gap: spacing.xl,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xl,
    marginBottom: spacing.xl,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginVertical: spacing.xl,
    marginHorizontal: layout.screenPaddingX,
    backgroundColor: colors.divider,
  },
});
