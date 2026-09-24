import { StyleSheet, View } from 'react-native';

import { CategoryIcon } from '@/components/CategoryIcon';
import { layout, spacing } from '@/theme';
import type { Category } from '@/types/models';

type CategoryGridProps = {
  categories: Category[];
};

export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <View style={styles.grid}>
      {categories.map((category) => (
        <View key={category.slug} style={styles.cell}>
          <CategoryIcon category={category} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing.md,
    paddingHorizontal: layout.screenPaddingX,
  },
  cell: {
    width: '25%',
    alignItems: 'center',
  },
});
