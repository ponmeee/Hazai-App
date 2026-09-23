import { ScrollView, StyleSheet } from 'react-native';

import { layout, spacing } from '@/theme';
import type { Category, CategorySlug } from '@/types/models';

import { Chip } from './Chip';

type CategoryChipListProps = {
  categories: Category[];
  selected: CategorySlug | null;
  onSelect: (slug: CategorySlug | null) => void;
};

/** 先頭に「すべて」(= null) を持つ横スクロールのカテゴリ選択 */
export function CategoryChipList({ categories, selected, onSelect }: CategoryChipListProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      <Chip label="すべて" selected={selected === null} onPress={() => onSelect(null)} />
      {categories.map((category) => (
        <Chip
          key={category.slug}
          label={category.name}
          selected={selected === category.slug}
          onPress={() => onSelect(category.slug)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.sm,
    paddingHorizontal: layout.screenPaddingX,
  },
});
