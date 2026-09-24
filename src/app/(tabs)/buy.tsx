import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { CategoryChipList } from '@/components/CategoryChipList';
import { EmptyState } from '@/components/EmptyState';
import { Header } from '@/components/Header';
import { ProductCard } from '@/components/ProductCard';
import { QueryView } from '@/components/QueryView';
import { Screen } from '@/components/Screen';
import { SearchBar } from '@/components/SearchBar';
import { TwoColumnGrid } from '@/components/TwoColumnGrid';
import { getCategories } from '@/features/categories/queries';
import { SellButton } from '@/features/products/components/SellButton';
import { useProducts } from '@/features/products/hooks';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { colors, layout, spacing, typography } from '@/theme';
import type { CategorySlug } from '@/types/models';

export default function BuyScreen() {
  const { q = '' } = useLocalSearchParams<{ q?: string }>();
  const [keyword, setKeyword] = useState(q);
  const [syncedQuery, setSyncedQuery] = useState(q);
  const [selectedCategory, setSelectedCategory] = useState<CategorySlug | null>(null);

  // タブ画面はマウントされたまま残るため、ホームから別の検索語で遷移してきたら入力欄へ反映する
  if (q !== syncedQuery) {
    setSyncedQuery(q);
    setKeyword(q);
  }

  const debouncedKeyword = useDebouncedValue(keyword.trim());
  const productsQuery = useProducts({ categorySlug: selectedCategory ?? undefined, keyword: debouncedKeyword });

  return (
    <Screen>
      <Header title="かう" right={<SellButton />} />
      <View style={styles.filters}>
        <View style={styles.search}>
          <SearchBar value={keyword} onChangeText={setKeyword} placeholder="端材をさがす" />
        </View>
        <CategoryChipList
          categories={getCategories()}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <QueryView query={productsQuery}>
          {(products) => (
            <>
              <Text style={styles.resultCount}>{products.length}件</Text>
              {products.length === 0 ? (
                <EmptyState
                  title="該当する端材がありません"
                  description="キーワードやカテゴリを変えて探してみてください。"
                />
              ) : (
                <TwoColumnGrid
                  items={products}
                  keyExtractor={(product) => product.id}
                  renderItem={(product) => <ProductCard product={product} />}
                />
              )}
            </>
          )}
        </QueryView>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: {
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  search: {
    paddingHorizontal: layout.screenPaddingX,
  },
  content: {
    gap: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxxl,
  },
  resultCount: {
    ...typography.caption,
    color: colors.textTertiary,
    paddingHorizontal: layout.screenPaddingX,
  },
});
