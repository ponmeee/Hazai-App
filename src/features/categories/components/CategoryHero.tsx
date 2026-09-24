import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { colors, layout, radius, spacing, typography } from '@/theme';
import type { Category } from '@/types/models';

type CategoryHeroProps = {
  category: Category;
  /** 読み込み中は undefined */
  productCount?: number;
};

export function CategoryHero({ category, productCount }: CategoryHeroProps) {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: category.heroImageUrl }}
        contentFit="cover"
        transition={200}
        style={styles.image}
      />
      <View style={styles.overlay}>
        <Text style={styles.name}>{category.name}</Text>
        <Text style={styles.count}>出品数 {productCount ?? '–'}件</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: layout.screenPaddingX,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  image: {
    width: '100%',
    aspectRatio: 16 / 10,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
    gap: spacing.xxs,
    padding: spacing.xl,
    backgroundColor: colors.overlay,
  },
  name: {
    ...typography.display,
    color: colors.textOnDark,
  },
  count: {
    ...typography.label,
    color: colors.textOnDark,
  },
});
