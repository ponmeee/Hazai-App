import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { CategoryChipList } from '@/components/CategoryChipList';
import { EmptyState } from '@/components/EmptyState';
import { HashtagChip } from '@/components/HashtagChip';
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
import { mergeTags, parseTags } from '@/utils/hashtags';

/** 検索語のうち「#」で始まる語をハッシュタグとして取り出す */
const splitKeyword = (text: string): { keyword: string; tags: string[] } => {
  const words = text.split(/\s+/);
  const tagWords = words.filter((word) => /^[#＃]/.test(word));
  return {
    keyword: words.filter((word) => !/^[#＃]/.test(word)).join(' ').trim(),
    tags: parseTags(tagWords.join(' ')),
  };
};

export default function BuyScreen() {
  const { q = '', tags: tagsParam = '' } = useLocalSearchParams<{ q?: string; tags?: string }>();
  const [keyword, setKeyword] = useState(q);
  const [tags, setTags] = useState(() => parseTags(tagsParam));
  const [syncedParams, setSyncedParams] = useState({ q, tags: tagsParam });
  const [selectedCategory, setSelectedCategory] = useState<CategorySlug | null>(null);

  // タブ画面はマウントされたまま残るため、ホームや作品から別の条件で遷移してきたら入力欄へ反映する
  if (q !== syncedParams.q || tagsParam !== syncedParams.tags) {
    setSyncedParams({ q, tags: tagsParam });
    setKeyword(q);
    setTags(parseTags(tagsParam));
  }

  // 入力途中の「#栗」はまだタグにせず、キーワードからも外しておく
  const debouncedKeyword = useDebouncedValue(splitKeyword(keyword).keyword);
  const productsQuery = useProducts({
    categorySlug: selectedCategory ?? undefined,
    keyword: debouncedKeyword,
    tags: tags.length === 0 ? undefined : tags,
  });

  const submitKeyword = () => {
    const split = splitKeyword(keyword);
    if (split.tags.length === 0) return;
    setTags((current) => mergeTags(current, split.tags));
    setKeyword(split.keyword);
  };

  return (
    <Screen>
      <Header title="かう" right={<SellButton />} />
      <View style={styles.filters}>
        <View style={styles.search}>
          <SearchBar
            value={keyword}
            onChangeText={setKeyword}
            onSubmit={submitKeyword}
            placeholder="端材をさがす（#でタグ検索）"
          />
        </View>
        {tags.length > 0 && (
          <View style={styles.tags}>
            {tags.map((tag) => (
              <HashtagChip key={tag} tag={tag} onRemove={() => setTags(tags.filter((current) => current !== tag))} />
            ))}
          </View>
        )}
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
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
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
