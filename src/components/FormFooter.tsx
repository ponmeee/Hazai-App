import { StyleSheet, Text, View } from 'react-native';

import { colors, layout, spacing, typography } from '@/theme';

import { Notice } from './Notice';
import { PrimaryButton } from './PrimaryButton';

type FormFooterProps = {
  submitLabel: string;
  onSubmit: () => void;
  isSubmitting: boolean;
  notice: string | null;
  errorMessage: string | null;
};

/** 入力フォームの下に固定する送信ボタンと、その上に出すお知らせ・エラー */
export function FormFooter({ submitLabel, onSubmit, isSubmitting, notice, errorMessage }: FormFooterProps) {
  return (
    <View style={styles.container}>
      {notice !== null && <Notice message={notice} />}
      {errorMessage !== null && <Text style={styles.error}>{errorMessage}</Text>}
      <PrimaryButton label={submitLabel} onPress={onSubmit} disabled={isSubmitting} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    paddingHorizontal: layout.screenPaddingX,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    textAlign: 'center',
  },
});
