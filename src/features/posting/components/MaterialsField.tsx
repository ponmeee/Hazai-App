import Ionicons from '@expo/vector-icons/Ionicons';
import { randomUUID } from 'expo-crypto';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { HashtagChip } from '@/components/HashtagChip';
import { HashtagInput } from '@/components/HashtagInput';
import { pickImagesFromLibrary } from '@/features/uploads/pickImages';
import { colors, fontWeights, radius, spacing, typography } from '@/theme';

import { MATERIAL_NAME_MAX_LENGTH, MAX_MATERIALS, type MaterialDraft } from '../validatePost';
import { PurchasedMaterialSheet, type PurchasedMaterial } from './PurchasedMaterialSheet';

type MaterialsFieldProps = {
  materials: MaterialDraft[];
  onChange: (materials: MaterialDraft[]) => void;
  onPickError: (message: string) => void;
  error?: string;
};

type MaterialCardProps = {
  material: MaterialDraft;
  onChange: (material: MaterialDraft) => void;
  onRemove: () => void;
};

function MaterialDraftCard({ material, onChange, onRemove }: MaterialCardProps) {
  const imageUri = material.kind === 'photo' ? material.image.uri : material.imageUrl;

  return (
    <View style={styles.card}>
      <View style={styles.photo}>
        {imageUri === null ? (
          <Ionicons name="image-outline" size={28} color={colors.textTertiary} />
        ) : (
          <Image source={{ uri: imageUri }} contentFit="cover" style={StyleSheet.absoluteFill} />
        )}
        {material.kind === 'purchased' && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>購入品</Text>
          </View>
        )}
        <Pressable
          onPress={onRemove}
          accessibilityRole="button"
          accessibilityLabel={`${material.name || '端材'}を外す`}
          hitSlop={spacing.xs}
          style={styles.removeButton}
        >
          <Ionicons name="close" size={14} color={colors.textOnDark} />
        </Pressable>
      </View>

      <TextInput
        value={material.name}
        onChangeText={(name) => onChange({ ...material, name })}
        placeholder="使った素材を入力"
        placeholderTextColor={colors.textTertiary}
        accessibilityLabel="使った素材の名前"
        maxLength={MATERIAL_NAME_MAX_LENGTH}
        style={styles.nameInput}
      />

      {material.kind === 'photo' ? (
        <HashtagInput
          compact
          tags={material.tags}
          onChange={(tags) => onChange({ ...material, tags })}
          placeholder="#タグ"
        />
      ) : (
        material.tags.length > 0 && (
          <View style={styles.tags}>
            {material.tags.map((tag) => (
              <HashtagChip key={tag} tag={tag} />
            ))}
          </View>
        )
      )}
    </View>
  );
}

/** 作品に使った端材の一覧と、写真・購入履歴からの追加 */
export function MaterialsField({ materials, onChange, onPickError, error }: MaterialsFieldProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const canAdd = materials.length < MAX_MATERIALS;

  const addPhotoMaterial = async () => {
    const result = await pickImagesFromLibrary(1);
    if (result === null) return;
    const [image] = result.images;
    if (image === undefined) {
      onPickError('画像を読み込めませんでした');
      return;
    }
    onChange([...materials, { key: randomUUID(), kind: 'photo', image, name: '', tags: [] }]);
  };

  const addPurchasedMaterial = (purchased: PurchasedMaterial) => {
    setIsSheetOpen(false);
    onChange([...materials, { key: randomUUID(), kind: 'purchased', ...purchased }]);
  };

  const replaceMaterial = (updated: MaterialDraft) =>
    onChange(materials.map((material) => (material.key === updated.key ? updated : material)));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>使用した端材・材料</Text>
      <View style={styles.grid}>
        {materials.map((material) => (
          <MaterialDraftCard
            key={material.key}
            material={material}
            onChange={replaceMaterial}
            onRemove={() => onChange(materials.filter((current) => current.key !== material.key))}
          />
        ))}
        {canAdd && (
          <View style={styles.card}>
            <View style={[styles.photo, styles.addBox]}>
              <Pressable
                onPress={addPhotoMaterial}
                accessibilityRole="button"
                hitSlop={spacing.xs}
                style={({ pressed }) => [styles.addAction, pressed && styles.pressed]}
              >
                <Ionicons name="camera-outline" size={22} color={colors.textTertiary} />
                <Text style={styles.addLabel}>写真を追加</Text>
              </Pressable>
              <Text style={styles.or}>または</Text>
              <Pressable
                onPress={() => setIsSheetOpen(true)}
                accessibilityRole="button"
                hitSlop={spacing.xs}
                style={({ pressed }) => pressed && styles.pressed}
              >
                <Text style={styles.addLabel}>購入履歴から追加</Text>
              </Pressable>
            </View>
            <Text style={styles.addHint}>使った素材を入力</Text>
          </View>
        )}
      </View>
      {error !== undefined && <Text style={styles.error}>{error}</Text>}

      <PurchasedMaterialSheet
        visible={isSheetOpen}
        selectedProductIds={materials.flatMap((material) => (material.kind === 'purchased' ? [material.productId] : []))}
        onSelect={addPurchasedMaterial}
        onClose={() => setIsSheetOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  title: {
    ...typography.subheading,
    ...fontWeights.bold,
    color: colors.textPrimary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.lg,
  },
  card: {
    width: '48%',
    gap: spacing.sm,
  },
  photo: {
    aspectRatio: 1,
    borderRadius: radius.md,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  badge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.full,
    backgroundColor: colors.glass,
  },
  badgeText: {
    ...typography.captionSmall,
    ...fontWeights.semiBold,
    color: colors.textPrimary,
  },
  removeButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 24,
    height: 24,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.overlay,
  },
  nameInput: {
    ...typography.caption,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderStrong,
    color: colors.textPrimary,
    outlineWidth: 0,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xxs,
  },
  addBox: {
    gap: spacing.xs,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    backgroundColor: colors.background,
  },
  addAction: {
    alignItems: 'center',
    gap: spacing.xxs,
  },
  pressed: {
    opacity: 0.6,
  },
  addLabel: {
    ...typography.bodySmall,
    ...fontWeights.semiBold,
    color: colors.textTertiary,
  },
  or: {
    ...typography.captionSmall,
    color: colors.textTertiary,
  },
  addHint: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
  },
});
