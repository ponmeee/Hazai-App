import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HashtagChip } from '@/components/HashtagChip';
import { openKeywordSearch, openTagSearch } from '@/features/products/navigation';
import { colors, fontWeights, layout, radius, spacing, typography } from '@/theme';
import type { GalleryMaterial } from '@/types/models';

import { useGalleryMaterials } from '../hooks';

/** 押すと「かう」で同じハッシュタグ（なければ名前）の端材を探す */
const searchSimilar = (material: GalleryMaterial) =>
  material.tags.length > 0 ? openTagSearch(material.tags) : openKeywordSearch(material.name);

function MaterialCard({ material }: { material: GalleryMaterial }) {
  return (
    <Pressable
      onPress={() => searchSimilar(material)}
      accessibilityRole="button"
      accessibilityLabel={`${material.name}に似た端材を探す`}
      style={styles.card}
    >
      {({ pressed }) => (
        <View style={[styles.cardContent, pressed && styles.pressed]}>
          <View style={styles.photo}>
            {material.imageUrl === null ? (
              <Ionicons name="image-outline" size={28} color={colors.textTertiary} />
            ) : (
              <Image source={material.imageUrl} contentFit="cover" transition={200} style={StyleSheet.absoluteFill} />
            )}
          </View>
          <Text style={styles.name} numberOfLines={2}>
            {material.name}
          </Text>
          {material.tags.length > 0 && (
            <View style={styles.tags}>
              {material.tags.map((tag) => (
                <HashtagChip key={tag} tag={tag} />
              ))}
            </View>
          )}
        </View>
      )}
    </Pressable>
  );
}

/** 作品に使われた端材。登録がなければ何も表示しない */
export function PostMaterialsSection({ postId }: { postId: string }) {
  const { data: materials } = useGalleryMaterials(postId);
  if (materials === undefined || materials.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>この作品に使われた端材</Text>
      <Text style={styles.hint}>タップすると、同じハッシュタグの端材を探せます</Text>
      <View style={styles.grid}>
        {materials.map((material) => (
          <MaterialCard key={material.id} material={material} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    paddingHorizontal: layout.screenPaddingX,
  },
  title: {
    ...typography.subheading,
    ...fontWeights.bold,
    color: colors.textPrimary,
  },
  hint: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.lg,
    marginTop: spacing.xs,
  },
  card: {
    width: '48%',
  },
  cardContent: {
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.7,
  },
  photo: {
    aspectRatio: 1,
    borderRadius: radius.md,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  name: {
    ...typography.caption,
    color: colors.textPrimary,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xxs,
  },
});
