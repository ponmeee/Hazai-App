import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Header } from '@/components/Header';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { ListingForm } from '@/features/listing/components/ListingForm';
import { ListingSuccess } from '@/features/listing/components/ListingSuccess';
import { useListingForm } from '@/features/listing/useListingForm';
import { colors, layout, shadows, spacing, typography } from '@/theme';

export default function NewProductScreen() {
  const { values, errors, hasErrors, isSubmitted, setField, submit, reset } = useListingForm();

  if (isSubmitted) {
    return (
      <Screen edges={['top', 'bottom']}>
        <Header showBack title="端材を出品" />
        <ListingSuccess onViewProducts={() => router.replace('/buy')} onListAnother={reset} />
      </Screen>
    );
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <Header showBack title="端材を出品" />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ListingForm values={values} errors={errors} setField={setField} />
      </ScrollView>
      <View style={styles.footer}>
        {hasErrors && <Text style={styles.errorSummary}>未入力または不正な項目があります</Text>}
        <PrimaryButton label="出品する" onPress={submit} />
      </View>
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
