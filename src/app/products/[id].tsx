import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { CategoryTag } from '@/components/CategoryTag';
import { EmptyState } from '@/components/EmptyState';
import { Header } from '@/components/Header';
import { Notice } from '@/components/Notice';
import { Screen } from '@/components/Screen';
import { getCategoryName } from '@/features/categories/queries';
import { ProductActionBar } from '@/features/products/components/ProductActionBar';
import { ProductImageViewer } from '@/features/products/components/ProductImageViewer';
import { ProductSpecList, type ProductSpec } from '@/features/products/components/ProductSpecList';
import { SellerCard } from '@/features/products/components/SellerCard';
import { productConditionLabels, shippingMethodLabels } from '@/features/products/labels';
import { getProductById } from '@/features/products/queries';
import { getUserById } from '@/features/users/queries';
import { useTransientMessage } from '@/hooks/useTransientMessage';
import { colors, layout, spacing, typography } from '@/theme';
import type { Product } from '@/types/models';
import { formatPrice } from '@/utils/format';

const buildSpecs = (product: Product): ProductSpec[] => [
  { label: 'サイズ', value: product.size ?? '-' },
  { label: '重量', value: product.weight ?? '-' },
  { label: '状態', value: productConditionLabels[product.condition] },
  {
    label: '配送方法',
    value: product.shippingMethods.map((method) => shippingMethodLabels[method]).join('・'),
  },
];

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = getProductById(id);
  const seller = product === undefined ? undefined : getUserById(product.sellerId);

  const [isFavorite, setIsFavorite] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [notice, showNotice] = useTransientMessage();

  if (product === undefined) {
    return (
      <Screen>
        <Header showBack />
        <EmptyState title="商品が見つかりません" description="削除されたか、URLが正しくない可能性があります。" />
      </Screen>
    );
  }

  const toggleFavorite = () => {
    showNotice(isFavorite ? 'お気に入りを解除しました' : 'お気に入りに追加しました');
    setIsFavorite((value) => !value);
  };

  const addToCart = () => {
    setIsInCart(true);
    showNotice('カートに追加しました');
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <Header showBack title="商品詳細" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ProductImageViewer imageUrls={product.imageUrls} productName={product.name} />

        <View style={styles.body}>
          <View style={styles.summary}>
            <CategoryTag label={getCategoryName(product.categorySlug)} tone="muted" />
            <Text style={styles.name}>{product.name}</Text>
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>商品説明</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>商品の情報</Text>
            <ProductSpecList specs={buildSpecs(product)} />
          </View>

          {seller !== undefined && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>出品者</Text>
              <SellerCard
                seller={seller}
                onContact={() => showNotice('メッセージ機能は準備中です')}
              />
            </View>
          )}
        </View>
      </ScrollView>

      <View>
        {notice !== null && (
          <View style={styles.noticeContainer}>
            <Notice message={notice} />
          </View>
        )}
        <ProductActionBar
          isFavorite={isFavorite}
          isInCart={isInCart}
          onToggleFavorite={toggleFavorite}
          onAddToCart={addToCart}
          onPurchase={() => showNotice('決済機能は準備中です')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxl,
  },
  body: {
    gap: spacing.xl,
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: spacing.xl,
  },
  summary: {
    gap: spacing.sm,
  },
  name: {
    ...typography.title,
    color: colors.textPrimary,
  },
  price: {
    ...typography.display,
    color: colors.textPrimary,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.heading,
    color: colors.textPrimary,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
  },
  noticeContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: '100%',
    marginBottom: spacing.md,
    pointerEvents: 'none',
    zIndex: 1,
  },
});
