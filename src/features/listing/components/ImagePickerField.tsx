import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FormField } from '@/components/FormField';
import { pickImagesFromLibrary, type PickedImage } from '@/features/uploads/pickImages';
import { colors, fontWeights, radius, spacing, typography } from '@/theme';

type ImagePickerFieldProps = {
  images: PickedImage[];
  maxCount: number;
  error?: string;
  onChange: (images: PickedImage[]) => void;
  onPickError: (message: string) => void;
};

export function ImagePickerField({ images, maxCount, error, onChange, onPickError }: ImagePickerFieldProps) {
  const remaining = maxCount - images.length;

  const pickImages = async () => {
    const result = await pickImagesFromLibrary(remaining);
    if (result === null) return;
    if (result.hasUnreadable) onPickError('読み込めなかった画像があります');
    onChange([...images, ...result.images].slice(0, maxCount));
  };

  const removeImage = (uri: string) => onChange(images.filter((image) => image.uri !== uri));

  return (
    <FormField label={`出品画像（最大${maxCount}枚）`} error={error} hint="1枚目が一覧に表示されます">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.list}>
        {remaining > 0 && (
          <Pressable
            onPress={pickImages}
            accessibilityRole="button"
            accessibilityLabel="画像を追加"
            style={({ pressed }) => [styles.tile, styles.addTile, pressed && styles.pressed]}
          >
            <Ionicons name="camera-outline" size={24} color={colors.textTertiary} />
            <Text style={styles.addLabel}>画像追加</Text>
          </Pressable>
        )}
        {images.map(({ uri }, index) => (
          <View key={uri} style={styles.tile}>
            <Image source={{ uri }} contentFit="cover" style={styles.image} />
            <Pressable
              onPress={() => removeImage(uri)}
              accessibilityRole="button"
              accessibilityLabel={`画像 ${index + 1} を削除`}
              hitSlop={6}
              style={styles.removeButton}
            >
              <Ionicons name="close" size={14} color={colors.textOnDark} />
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </FormField>
  );
}

const TILE_SIZE = 80;

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: radius.sm,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  addTile: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.textTertiary,
    backgroundColor: colors.background,
  },
  pressed: {
    backgroundColor: colors.surface,
  },
  addLabel: {
    ...typography.captionSmall,
    ...fontWeights.semiBold,
    color: colors.textTertiary,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 22,
    height: 22,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.overlay,
  },
});
