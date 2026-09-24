import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { getErrorMessage } from '@/api/errors';
import { FormInput } from '@/components/FormInput';
import { Header } from '@/components/Header';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { UserAvatar } from '@/components/UserAvatar';
import { updateAvatar, updateProfile, type ProfileInput } from '@/features/auth/api';
import { useAuth } from '@/features/auth/AuthProvider';
import { RequireAuth } from '@/features/auth/components/RequireAuth';
import { pickImagesFromLibrary } from '@/features/uploads/pickImages';
import { colors, fontWeights, layout, shadows, spacing, typography } from '@/theme';
import type { Account } from '@/types/models';
import { goBackOr } from '@/utils/navigation';

const BIO_MAX_LENGTH = 300;

function ProfileEditForm({ account }: { account: Account }) {
  const { setAccount } = useAuth();
  const [input, setInput] = useState<ProfileInput>({
    name: account.name,
    location: account.location,
    genre: account.genre,
    bio: account.bio,
  });
  const [nameError, setNameError] = useState<string | undefined>();

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updated) => {
      setAccount(updated);
      goBackOr('/mypage');
    },
  });

  const avatarMutation = useMutation({ mutationFn: updateAvatar, onSuccess: setAccount });

  const changeAvatar = async () => {
    const picked = await pickImagesFromLibrary(1);
    const image = picked?.images[0];
    if (image !== undefined) avatarMutation.mutate(image);
  };

  const setField = (key: keyof ProfileInput) => (value: string) =>
    setInput((current) => ({ ...current, [key]: value }));

  const save = () => {
    const error = input.name.trim() === '' ? '名前を入力してください' : undefined;
    setNameError(error);
    if (error === undefined) mutation.mutate(input);
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.avatarSection}>
          <UserAvatar uri={account.avatarUrl} size={88} name={account.name} />
          <Pressable
            onPress={() => void changeAvatar()}
            disabled={avatarMutation.isPending}
            accessibilityRole="button"
            accessibilityLabel="プロフィール画像を変更"
          >
            <Text style={styles.avatarLink}>{avatarMutation.isPending ? 'アップロード中…' : '画像を変更'}</Text>
          </Pressable>
          {avatarMutation.isError && <Text style={styles.submitError}>{getErrorMessage(avatarMutation.error)}</Text>}
        </View>
        <FormInput label="名前" required value={input.name} onChangeText={setField('name')} maxLength={30} error={nameError} />
        <View style={styles.row}>
          <View style={styles.rowItem}>
            <FormInput label="地域" value={input.location} onChangeText={setField('location')} maxLength={30} />
          </View>
          <View style={styles.rowItem}>
            <FormInput label="ジャンル" value={input.genre} onChangeText={setField('genre')} maxLength={30} />
          </View>
        </View>
        <FormInput
          label="自己紹介"
          multiline
          value={input.bio}
          onChangeText={setField('bio')}
          maxLength={BIO_MAX_LENGTH}
          hint={`${input.bio.length}/${BIO_MAX_LENGTH}`}
        />
      </ScrollView>
      <View style={styles.footer}>
        {mutation.isError && <Text style={styles.submitError}>{getErrorMessage(mutation.error)}</Text>}
        <PrimaryButton label={mutation.isPending ? '保存中…' : '保存する'} onPress={save} disabled={mutation.isPending} />
      </View>
    </>
  );
}

export default function ProfileEditScreen() {
  return (
    <Screen edges={['top', 'bottom']}>
      <Header showBack title="プロフィール編集" />
      <RequireAuth description="プロフィールを編集するにはログインしてください。">
        {(account) => <ProfileEditForm account={account} />}
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
  avatarSection: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatarLink: {
    ...typography.label,
    ...fontWeights.bold,
    color: colors.accent,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  rowItem: {
    flex: 1,
  },
  footer: {
    ...shadows.floating,
    gap: spacing.sm,
    paddingHorizontal: layout.screenPaddingX,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
  },
  submitError: {
    ...typography.caption,
    color: colors.danger,
    textAlign: 'center',
  },
});
