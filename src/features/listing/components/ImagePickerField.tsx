import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FormField } from '@/components/FormField';
import { colors, radius, spacing, typography } from '@/theme';

import type { ListingImage } from '../validateListing';

type ImagePickerFieldProps = {
  images: ListingImage[];
  maxCount: number;
  error?: string;
  onChange: (images: ListingImage[]) => void;
  onPickError: (message: string) => void;
};

export function ImagePickerField({ images, maxCount, error, onChange, onPickError }: ImagePickerFieldProps) {
  const remaining = maxCount - images.length;

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.7,
      // アップロードを Web・ネイティブ共通の JSON で行うため base64 で受け取る
      base64: true,
    });
    if (result.canceled) return;
    const picked = result.assets.flatMap((asset) =>
      typeof asset.base64 === 'string' ? [{ uri: asset.uri, base64: asset.base64 }] : [],
    );
    if (picked.length < result.assets.length) onPickError('読み込めなかった画像があります');
    onChange([...images, ...picked].slice(0, maxCount));
  };

  const removeImage = (uri: string) => onChange(images.filter((image) => image.uri !== uri));

  return (
    <FormField label={`商品画像（${images.length}/${maxCount}）`} error={error} hint="1枚目が一覧に表示されます">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.list}>
        {remaining > 0 && (
          <Pressable
            onPress={pickImages}
            accessibilityRole="button"
            accessibilityLabel="画像を追加"
            style={({ pressed }) => [styles.tile, styles.addTile, pressed && styles.pressed]}
          >
            <Ionicons name="camera-outline" size={24} color={colors.textSecondary} />
            <Text style={styles.addLabel}>追加</Text>
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

const TILE_SIZE = 88;

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  addTile: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
  },
  pressed: {
    backgroundColor: colors.surfaceMuted,
  },
  addLabel: {
    ...typography.caption,
    color: colors.textSecondary,
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
