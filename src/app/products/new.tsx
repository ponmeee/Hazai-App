import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Header } from '@/components/Header';
import { Notice } from '@/components/Notice';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { RequireAuth } from '@/features/auth/components/RequireAuth';
import { ListingForm } from '@/features/listing/components/ListingForm';
import { ListingSuccess } from '@/features/listing/components/ListingSuccess';
import { useListingForm } from '@/features/listing/useListingForm';
import { useTransientMessage } from '@/hooks/useTransientMessage';
import { colors, layout, shadows, spacing, typography } from '@/theme';

function NewProductForm() {
  const { values, errors, hasErrors, setField, submit, reset, isSubmitting, submitError, createdProduct } =
    useListingForm();
  const [notice, showNotice] = useTransientMessage();

  if (createdProduct !== null) {
    return (
      <ListingSuccess
        onViewProduct={() => router.replace({ pathname: '/products/[id]', params: { id: createdProduct.id } })}
        onListAnother={reset}
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
      <View style={styles.footer}>
        {notice !== null && <Notice message={notice} />}
        {hasErrors && <Text style={styles.errorSummary}>未入力または不正な項目があります</Text>}
        {submitError !== null && <Text style={styles.errorSummary}>{submitError}</Text>}
        <PrimaryButton label={isSubmitting ? '出品中…' : '出品する'} onPress={submit} disabled={isSubmitting} />
      </View>
    </>
  );
}

export default function NewProductScreen() {
  return (
    <Screen edges={['top', 'bottom']}>
      <Header showBack title="端材を出品" />
      <RequireAuth description="端材を出品するにはログインしてください。">{() => <NewProductForm />}</RequireAuth>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  footer: {
    ...shadows.floating,
    gap: spacing.sm,
    paddingHorizontal: layout.screenPaddingX,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
  },
  errorSummary: {
    ...typography.caption,
    color: colors.danger,
    textAlign: 'center',
  },
});
