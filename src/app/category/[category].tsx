import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { GalleryPortraitCard } from '@/components/GalleryPortraitCard';
import { Header } from '@/components/Header';
import { ProductCard } from '@/components/ProductCard';
import { QueryView } from '@/components/QueryView';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { TwoColumnGrid } from '@/components/TwoColumnGrid';
import { CategoryHero } from '@/features/categories/components/CategoryHero';
import { getCategoryBySlug } from '@/features/categories/queries';
import { useGalleryPosts } from '@/features/gallery/hooks';
import { useProducts } from '@/features/products/hooks';
import { layout, spacing } from '@/theme';
import type { Category } from '@/types/models';

function CategoryContent({ category }: { category: Category }) {
  const productsQuery = useProducts({ categorySlug: category.slug });
  const postsQuery = useGalleryPosts({ categorySlug: category.slug });

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <CategoryHero category={category} productCount={productsQuery.data?.length} />

      <View style={styles.section}>
        <SectionHeader title="ギャラリー" actionHref="/gallery" />
        <QueryView query={postsQuery}>
          {(posts) =>
            posts.length === 0 ? (
              <EmptyState title="まだ作品がありません" />
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.galleryList}
              >
                {posts.map((post) => (
                  <GalleryPortraitCard key={post.id} post={post} style={styles.galleryCard} />
                ))}
              </ScrollView>
            )
          }
        </QueryView>
      </View>

      <View style={styles.section}>
        <SectionHeader title="出品された端材" />
        <QueryView query={productsQuery}>
          {(products) =>
            products.length === 0 ? (
              <EmptyState title="まだ出品がありません" />
            ) : (
              <TwoColumnGrid
                items={products}
                keyExtractor={(product) => product.id}
                renderItem={(product) => <ProductCard product={product} />}
              />
            )
          }
        </QueryView>
      </View>
    </ScrollView>
  );
}

export default function CategoryScreen() {
  const { category: slug } = useLocalSearchParams<{ category: string }>();
  const category = getCategoryBySlug(slug);

  return (
    <Screen>
      <Header showBack title={category?.name} />
      {category === undefined ? (
        <EmptyState title="カテゴリが見つかりません" />
      ) : (
        <CategoryContent category={category} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.xxxl,
    paddingBottom: spacing.xxxl,
  },
  section: {
    gap: spacing.lg,
  },
  galleryList: {
    gap: spacing.lg,
    paddingHorizontal: layout.screenPaddingX,
  },
  galleryCard: {
    width: 180,
  },
});
