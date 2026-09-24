import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { FormFooter } from '@/components/FormFooter';
import { Header } from '@/components/Header';
import { QueryView } from '@/components/QueryView';
import { Screen } from '@/components/Screen';
import { SuccessState } from '@/components/SuccessState';
import { RequireAuth } from '@/features/auth/components/RequireAuth';
import { ListingForm } from '@/features/listing/components/ListingForm';
import { useEditListingForm } from '@/features/listing/useListingForm';
import { useProduct } from '@/features/products/hooks';
import { useTransientMessage } from '@/hooks/useTransientMessage';
import { layout, spacing } from '@/theme';
import type { Product } from '@/types/models';

function EditProductForm({ product }: { product: Product }) {
  const { values, errors, hasErrors, setField, submit, isSubmitting, submitError, updatedProduct } =
    useEditListingForm(product);
  const [notice, showNotice] = useTransientMessage();

  if (updatedProduct !== null) {
    return (
      <SuccessState
        title="商品情報を更新しました"
        description="変更内容は一覧と商品ページに反映されます。"
        primaryAction={{
          label: '商品ページへ',
          onPress: () => router.replace({ pathname: '/products/[id]', params: { id: updatedProduct.id } }),
        }}
        secondaryAction={{ label: 'マイページへ', onPress: () => router.replace('/mypage') }}
      />
    );
  }

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ListingForm
          values={values}
          errors={errors}
          setField={setField}
          onImagePickError={showNotice}
          showImageField={false}
        />
      </ScrollView>
      <FormFooter
        submitLabel={isSubmitting ? '保存中…' : '変更を保存する'}
        onSubmit={submit}
        isSubmitting={isSubmitting}
        notice={notice}
        errorMessage={submitError ?? (hasErrors ? '未入力または不正な項目があります' : null)}
      />
    </>
  );
}

function EditProductContent({ productId, accountId }: { productId: string; accountId: string }) {
  const productQuery = useProduct(productId);
  return (
    <QueryView query={productQuery}>
      {(product) =>
        // 最終的な権限チェックは RLS で行う。ここでは他人の商品にフォームを出さないだけ
        product.seller.id === accountId ? (
          <EditProductForm product={product} />
        ) : (
          <EmptyState title="この商品は編集できません" />
        )
      }
    </QueryView>
  );
}

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <Screen edges={['top', 'bottom']}>
      <Header showBack title="出品内容を編集" />
      <RequireAuth description="出品内容を編集するにはログインしてください。">
        {(account) => <EditProductContent productId={id} accountId={account.id} />}
      </RequireAuth>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
});
