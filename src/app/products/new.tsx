import { router } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';

import { FormFooter } from '@/components/FormFooter';
import { Header } from '@/components/Header';
import { Screen } from '@/components/Screen';
import { SuccessState } from '@/components/SuccessState';
import { RequireAuth } from '@/features/auth/components/RequireAuth';
import { ListingForm } from '@/features/listing/components/ListingForm';
import { useListingForm } from '@/features/listing/useListingForm';
import { useTransientMessage } from '@/hooks/useTransientMessage';
import { layout, spacing } from '@/theme';

function NewProductForm() {
  const { values, errors, hasErrors, setField, submit, reset, isSubmitting, submitError, createdProduct } =
    useListingForm();
  const [notice, showNotice] = useTransientMessage();

  if (createdProduct !== null) {
    return (
      <SuccessState
        title="出品しました"
        description="「かう」や各カテゴリの一覧に表示されます。"
        primaryAction={{
          label: '出品した商品を見る',
          onPress: () => router.replace({ pathname: '/products/[id]', params: { id: createdProduct.id } }),
        }}
        secondaryAction={{ label: '続けて出品する', onPress: reset }}
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
        <ListingForm values={values} errors={errors} setField={setField} onImagePickError={showNotice} />
      </ScrollView>
      <FormFooter
        submitLabel={isSubmitting ? '出品中…' : '端材を出品する'}
        onSubmit={submit}
        isSubmitting={isSubmitting}
        notice={notice}
        errorMessage={submitError ?? (hasErrors ? '未入力または不正な項目があります' : null)}
      />
    </>
  );
}

export default function NewProductScreen() {
  return (
    <Screen edges={['top', 'bottom']}>
      <Header showBack title="端材を出品する" />
      <RequireAuth description="端材を出品するにはログインしてください。">{() => <NewProductForm />}</RequireAuth>
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
