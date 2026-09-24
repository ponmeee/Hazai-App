import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FormField } from '@/components/FormField';
import { pickImagesFromLibrary, type PickedImage } from '@/features/uploads/pickImages';
import { colors, fontWeights, radius, spacing, typography } from '@/theme';

type AvatarPickerFieldProps = {
  image: PickedImage | null;
  onChange: (image: PickedImage | null) => void;
  onPickError: (message: string) => void;
};

const AVATAR_SIZE = 64;

export function AvatarPickerField({ image, onChange, onPickError }: AvatarPickerFieldProps) {
  const pick = async () => {
    const result = await pickImagesFromLibrary(1);
    if (result === null) return;
    const [picked] = result.images;
    if (picked === undefined) {
      onPickError('画像を読み込めませんでした');
      return;
    }
    onChange(picked);
  };

  return (
    <FormField label="アイコン">
      <View style={styles.row}>
        <Pressable
          onPress={pick}
          accessibilityRole="button"
          accessibilityLabel={image === null ? 'アイコンの写真を追加' : 'アイコンの写真を変更'}
          style={({ pressed }) => [styles.avatar, image === null && styles.avatarEmpty, pressed && styles.pressed]}
        >
          {image === null ? (
            <>
              <Ionicons name="camera-outline" size={20} color={colors.textTertiary} />
              <Text style={styles.addLabel}>写真を追加</Text>
            </>
          ) : (
            <Image source={{ uri: image.uri }} contentFit="cover" style={styles.image} />
          )}
        </Pressable>
        {image !== null && (
          <Pressable onPress={() => onChange(null)} accessibilityRole="button" hitSlop={spacing.sm}>
            <Text style={styles.removeLabel}>写真を外す</Text>
          </Pressable>
        )}
      </View>
    </FormField>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: radius.full,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  avatarEmpty: {
    gap: spacing.xxs,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    backgroundColor: colors.background,
  },
  pressed: {
    opacity: 0.6,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  addLabel: {
    ...typography.micro,
    ...fontWeights.semiBold,
    color: colors.textTertiary,
  },
  removeLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
