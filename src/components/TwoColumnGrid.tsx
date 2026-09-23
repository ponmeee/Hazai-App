import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { layout, spacing } from '@/theme';

type TwoColumnGridProps<T> = {
  items: T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T) => ReactNode;
};

const chunkPairs = <T,>(items: T[]): T[][] => {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    rows.push(items.slice(i, i + 2));
  }
  return rows;
};

/**
 * ScrollView 内で他セクションと並べられるよう、FlatList ではなく行単位で描画する。
 * 奇数件の最終行は空セルで幅を揃える。
 */
export function TwoColumnGrid<T>({ items, keyExtractor, renderItem }: TwoColumnGridProps<T>) {
  return (
    <View style={styles.grid}>
      {chunkPairs(items).map((row) => (
        <View key={row.map(keyExtractor).join('-')} style={styles.row}>
          {row.map((item) => (
            <View key={keyExtractor(item)} style={styles.cell}>
              {renderItem(item)}
            </View>
          ))}
          {row.length === 1 && <View style={styles.cell} />}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: spacing.xl,
    paddingHorizontal: layout.screenPaddingX,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cell: {
    flex: 1,
  },
});
