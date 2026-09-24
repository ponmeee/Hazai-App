import { ScrollView, StyleSheet } from 'react-native';

import { layout, spacing } from '@/theme';
import type { Category, CategorySlug } from '@/types/models';

import { Chip } from './Chip';
import { SoftChip } from './SoftChip';

type CategoryChipListProps = {
  categories: Category[];
  selected: CategorySlug | null;
  onSelect: (slug: CategorySlug | null) => void;
  /** outline: 枠線付きのチップ / soft: 淡いグレーのチップ */
  variant?: 'outline' | 'soft';
};

/** 先頭に「すべて」(= null) を持つ横スクロールのカテゴリ選択 */
export function CategoryChipList({ categories, selected, onSelect, variant = 'outline' }: CategoryChipListProps) {
  const ChipComponent = variant === 'soft' ? SoftChip : Chip;
  const options: { slug: CategorySlug | null; label: string }[] = [
    { slug: null, label: 'すべて' },
    ...categories.map((category) => ({ slug: category.slug, label: category.name })),
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.content, variant === 'soft' && styles.contentSoft]}
    >
      {options.map((option) => (
        <ChipComponent
          key={option.slug ?? 'all'}
          label={option.label}
          selected={selected === option.slug}
          onPress={() => onSelect(option.slug)}
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
  contentSoft: {
    gap: spacing.md,
  },
});
