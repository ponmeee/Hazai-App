import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { getErrorMessage } from '@/api/errors';
import { CategoryTag } from '@/components/CategoryTag';
import { Header } from '@/components/Header';
import { Notice } from '@/components/Notice';
import { OwnerActionBar } from '@/components/OwnerActionBar';
import { QueryView } from '@/components/QueryView';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/features/auth/AuthProvider';
import { useProductCart } from '@/features/cart/hooks';
import { getCategoryName } from '@/features/categories/queries';
import { useProductFavorite } from '@/features/favorites/hooks';
import { useStartConversation } from '@/features/messages/hooks';
import { ProductActionBar } from '@/features/products/components/ProductActionBar';
import { ProductImageViewer } from '@/features/products/components/ProductImageViewer';
import { ProductSpecList, type ProductSpec } from '@/features/products/components/ProductSpecList';
import { SellerCard } from '@/features/products/components/SellerCard';
import { useDeleteProduct, useProduct } from '@/features/products/hooks';
import { productConditionLabels, shippingMethodLabels } from '@/features/products/labels';
import { useTransientMessage } from '@/hooks/useTransientMessage';
import { colors, layout, shadows, spacing, typography } from '@/theme';
import type { Product } from '@/types/models';
import { formatPrice } from '@/utils/format';
import { goBackOr } from '@/utils/navigation';

const buildSpecs = (product: Product): ProductSpec[] => [
  { label: 'サイズ', value: product.size ?? '-' },
  { label: '重量', value: product.weight ?? '-' },
  { label: '状態', value: product.condition === null ? '-' : productConditionLabels[product.condition] },
  {
    label: '配送方法',
    value: product.shippingMethods.map((method) => shippingMethodLabels[method]).join('・'),
  },
];

function ProductDetail({ product }: { product: Product }) {
  const { status, account } = useAuth();
  const isOwnProduct = account?.id === product.seller.id;

  const favorite = useProductFavorite(product);
  const cart = useProductCart(product.id);
  const deleteProduct = useDeleteProduct();
  const [notice, showNotice] = useTransientMessage();
  const startConversation = useStartConversation();

  const toggleFavorite = () => {
    if (status === 'signedIn') {
      showNotice(favorite.isFavorite ? 'お気に入りを解除しました' : 'お気に入りに追加しました');
    }
    favorite.toggle((error) => showNotice(getErrorMessage(error)));
  };

  const toggleCart = () => {
    cart.toggle({
      onSuccess: (inCart) => showNotice(inCart ? 'カートに追加しました' : 'カートから外しました'),
      onError: (error) => showNotice(getErrorMessage(error)),
    });
  };

  const removeListing = () => {
    deleteProduct.mutate(product.id, {
      onSuccess: () => goBackOr('/mypage'),
      onError: (error) => showNotice(getErrorMessage(error)),
    });
  };

  const contactSeller = () => {
    if (status !== 'signedIn') {
      router.push('/login');
      return;
    }
    startConversation.mutate(
      { userId: product.seller.id, productId: product.id },
      {
        onSuccess: (conversation) =>
          router.push({ pathname: '/messages/[id]', params: { id: conversation.id } }),
        onError: (error) => showNotice(getErrorMessage(error)),
      },
    );
  };

  return (
    <>
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

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>出品者</Text>
            <SellerCard
              seller={product.seller}
              onContact={isOwnProduct ? undefined : contactSeller}
              isContacting={startConversation.isPending}
            />
          </View>
        </View>
      </ScrollView>

      <View>
        {notice !== null && (
          <View style={styles.noticeContainer}>
            <Notice message={notice} />
          </View>
        )}
        {isOwnProduct ? (
          <OwnerActionBar
            note="あなたが出品した商品です"
            deleteLabel="出品を取り消す"
            isDeleting={deleteProduct.isPending}
            onDelete={removeListing}
            secondaryAction={{
              label: '編集する',
              onPress: () => router.push({ pathname: '/products/[id]/edit', params: { id: product.id } }),
            }}
            style={styles.ownerActions}
          />
        ) : (
          <ProductActionBar
            isFavorite={favorite.isFavorite}
            isInCart={cart.isInCart}
            isUpdatingCart={cart.isUpdating}
            onToggleFavorite={toggleFavorite}
            onToggleCart={toggleCart}
            onPurchase={() => showNotice('決済機能は準備中です')}
          />
        )}
      </View>
    </>
  );
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const productQuery = useProduct(id);

  return (
    <Screen edges={['top', 'bottom']}>
      <Header showBack title="商品詳細" />
      <QueryView query={productQuery}>{(product) => <ProductDetail product={product} />}</QueryView>
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
  ownerActions: {
    ...shadows.floating,
    paddingHorizontal: layout.screenPaddingX,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
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
