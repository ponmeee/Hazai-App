import { ScrollView, StyleSheet } from 'react-native';

import { ProductCard } from '@/components/ProductCard';
import { layout, spacing } from '@/theme';
import type { Product } from '@/types/models';

type PopularProductsProps = {
  products: Product[];
};

export function PopularProducts({ products }: PopularProductsProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} style={styles.card} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    paddingHorizontal: layout.screenPaddingX,
  },
  card: {
    width: 176,
  },
});
