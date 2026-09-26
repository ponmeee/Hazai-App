import { router } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';

import { ChipSelector } from '@/components/ChipSelector';
import { FormField } from '@/components/FormField';
import { FormFooter } from '@/components/FormFooter';
import { Header } from '@/components/Header';
import { Screen } from '@/components/Screen';
import { SuccessState } from '@/components/SuccessState';
import { RequireAuth } from '@/features/auth/components/RequireAuth';
import { getCategoryOptions } from '@/features/categories/queries';
import { MaterialsField } from '@/features/posting/components/MaterialsField';
import { PostEditorCard } from '@/features/posting/components/PostEditorCard';
import { usePostForm } from '@/features/posting/usePostForm';
import { useTransientMessage } from '@/hooks/useTransientMessage';
import { layout, spacing } from '@/theme';
import type { UserSummary } from '@/types/models';

const categoryOptions = getCategoryOptions();

function NewPostForm({ author }: { author: UserSummary }) {
  const { values, errors, setField, submit, reset, isSubmitting, submitError, createdPost } = usePostForm();
  const [notice, showNotice] = useTransientMessage();

  if (createdPost !== null) {
    return (
      <SuccessState
        title="投稿しました"
        description="ギャラリーやマイページに表示されます。"
        primaryAction={{ label: 'ギャラリーを見る', onPress: () => router.replace('/gallery') }}
        secondaryAction={{ label: '続けて投稿する', onPress: reset }}
      />
    );
  }

  // カード内の入力欄には個別のエラー表示がないため、最初の問題を送信ボタンの上に出す
  const firstError = errors.images ?? errors.title ?? errors.body ?? errors.materials ?? null;

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <FormField label="素材カテゴリ" required error={errors.categorySlug}>
          <ChipSelector
            layout="scroll"
            options={categoryOptions}
            isSelected={(slug) => values.categorySlug === slug}
            onPress={(slug) => setField('categorySlug', slug)}
          />
        </FormField>
        <PostEditorCard values={values} setField={setField} author={author} onImagePickError={showNotice} />
        <MaterialsField
          materials={values.materials}
          onChange={(materials) => setField('materials', materials)}
          onPickError={showNotice}
          error={errors.materials}
        />
      </ScrollView>
      <FormFooter
        submitLabel={isSubmitting ? '投稿中…' : '作品を投稿する'}
        onSubmit={submit}
        isSubmitting={isSubmitting}
        notice={notice}
        errorMessage={submitError ?? firstError}
      />
    </>
  );
}

export default function NewPostScreen() {
  return (
    <Screen edges={['top', 'bottom']}>
      <Header showBack title="作品を投稿する" />
      <RequireAuth description="作品を投稿するにはログインしてください。">
        {(account) => <NewPostForm author={account} />}
      </RequireAuth>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.xl,
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
});
