import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { Header } from '@/components/Header';
import { IconButton } from '@/components/IconButton';
import { QueryView } from '@/components/QueryView';
import { Screen } from '@/components/Screen';
import { SearchBar } from '@/components/SearchBar';
import { SectionHeader } from '@/components/SectionHeader';
import { getCategories } from '@/features/categories/queries';
import { GalleryPortraitList } from '@/features/gallery/components/GalleryPortraitList';
import { useGalleryPosts } from '@/features/gallery/hooks';
import { CategoryGrid } from '@/features/home/components/CategoryGrid';
import { HomeHero } from '@/features/home/components/HomeHero';
import { Logo } from '@/features/home/components/Logo';
import { PopularProducts } from '@/features/home/components/PopularProducts';
import { usePopularProducts } from '@/features/products/hooks';
import { layout, spacing } from '@/theme';

const RECOMMENDED_PRODUCT_LIMIT = 8;
const FEATURED_POST_LIMIT = 8;

export default function HomeScreen() {
  const [keyword, setKeyword] = useState('');
  const recommendedProducts = usePopularProducts(RECOMMENDED_PRODUCT_LIMIT);
  // いいねの集計はまだないため、新しい作品を並べる
  const featuredPosts = useGalleryPosts({ limit: FEATURED_POST_LIMIT });

  const searchProducts = () => {
    router.push({ pathname: '/buy', params: { q: keyword.trim() } });
  };

  return (
    <Screen>
      <Header
        left={<Logo />}
        right={
          <View style={styles.headerActions}>
            <IconButton
              icon="chatbox-ellipses-outline"
              accessibilityLabel="メッセージ"
              onPress={() => router.push('/messages')}
            />
            <IconButton icon="notifications-outline" accessibilityLabel="通知" />
          </View>
        }
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.search}>
            <SearchBar
              value={keyword}
              onChangeText={setKeyword}
              onSubmit={searchProducts}
              placeholder="キーワードで探す"
            />
          </View>
          <HomeHero />
        </View>

        <View style={styles.section}>
          <SectionHeader title="カテゴリでさがす" />
          <CategoryGrid categories={getCategories()} />
        </View>

        <View style={styles.section}>
          <SectionHeader title="おすすめの端材" actionHref="/buy" />
          <QueryView query={recommendedProducts}>
            {(products) =>
              products.length === 0 ? (
                <EmptyState title="まだ出品がありません" />
              ) : (
                <PopularProducts products={products} />
              )
            }
          </QueryView>
        </View>

        <View style={styles.section}>
          <SectionHeader title="人気の作品" actionHref="/gallery" />
          <QueryView query={featuredPosts}>
            {(posts) =>
              posts.length === 0 ? <EmptyState title="まだ作品がありません" /> : <GalleryPortraitList posts={posts} />
            }
          </QueryView>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    gap: spacing.xxl,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xxxl,
  },
  search: {
    paddingHorizontal: layout.screenPaddingX,
  },
  section: {
    gap: spacing.lg,
  },
});
