import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { getErrorMessage } from '@/api/client';
import { CategoryChipList } from '@/components/CategoryChipList';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { GalleryPostCard } from '@/components/GalleryPostCard';
import { Header } from '@/components/Header';
import { LoadingState } from '@/components/LoadingState';
import { Screen } from '@/components/Screen';
import { getCategories } from '@/features/categories/queries';
import { FollowingUserList } from '@/features/gallery/components/FollowingUserList';
import { useGalleryPosts } from '@/features/gallery/hooks';
import { useFollowingUsers } from '@/features/users/hooks';
import { colors, layout, spacing } from '@/theme';
import type { CategorySlug } from '@/types/models';

export default function GalleryScreen() {
  const [selectedCategory, setSelectedCategory] = useState<CategorySlug | null>(null);
  const postsQuery = useGalleryPosts({ categorySlug: selectedCategory ?? undefined });
  const followingQuery = useFollowingUsers();
  const followingUsers = followingQuery.data ?? [];

  const renderEmpty = () => {
    if (postsQuery.isPending) return <LoadingState />;
    if (postsQuery.isError) {
      return (
        <ErrorState message={getErrorMessage(postsQuery.error)} onRetry={() => void postsQuery.refetch()} />
      );
    }
    return <EmptyState title="このカテゴリの作品はまだありません" />;
  };

  return (
    <Screen>
      <Header title="ギャラリー" />
      <FlatList
        data={postsQuery.data ?? []}
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
            {followingUsers.length > 0 && <FollowingUserList users={followingUsers} />}
          </View>
        }
        ListEmptyComponent={renderEmpty}
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
