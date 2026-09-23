import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Header } from '@/components/Header';
import { IconButton } from '@/components/IconButton';
import { Screen } from '@/components/Screen';
import { SearchBar } from '@/components/SearchBar';
import { SectionHeader } from '@/components/SectionHeader';
import { getCategories } from '@/features/categories/queries';
import { CategoryGrid } from '@/features/home/components/CategoryGrid';
import { HomeHero } from '@/features/home/components/HomeHero';
import { Logo } from '@/features/home/components/Logo';
import { PopularProducts } from '@/features/home/components/PopularProducts';
import { getHomeHeroImageUrl } from '@/features/home/queries';
import { getPopularProducts } from '@/features/products/queries';
import { layout, spacing } from '@/theme';

const POPULAR_PRODUCT_LIMIT = 8;

export default function HomeScreen() {
  const [keyword, setKeyword] = useState('');

  const searchProducts = () => {
    router.push({ pathname: '/buy', params: { q: keyword.trim() } });
  };

  return (
    <Screen>
      <Header
        left={<Logo />}
        right={<IconButton icon="notifications-outline" accessibilityLabel="通知" />}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.search}>
            <SearchBar value={keyword} onChangeText={setKeyword} onSubmit={searchProducts} />
          </View>
          <HomeHero imageUrl={getHomeHeroImageUrl()} />
        </View>

        <View style={styles.section}>
          <SectionHeader title="カテゴリ" />
          <CategoryGrid categories={getCategories()} />
        </View>

        <View style={styles.section}>
          <SectionHeader title="人気の商品" actionHref="/buy" />
          <PopularProducts products={getPopularProducts(POPULAR_PRODUCT_LIMIT)} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
