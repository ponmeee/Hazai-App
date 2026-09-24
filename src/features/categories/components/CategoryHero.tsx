import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme';
import type { Category } from '@/types/models';
import { formatNumber } from '@/utils/format';

type CategoryHeroProps = {
  category: Category;
  /** 読み込み中は undefined */
  productCount?: number;
};

export function CategoryHero({ category, productCount }: CategoryHeroProps) {
  return (
    <View style={styles.container}>
      <Image
        source={category.heroImage}
        contentFit="cover"
        transition={200}
        style={styles.image}
      />
      <View style={styles.overlay}>
        <Text style={styles.name}>{category.name}</Text>
        <Text style={styles.count}>{productCount === undefined ? '–' : formatNumber(productCount)}点</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
  },
  image: {
    width: '100%',
    // カテゴリのトップ画像素材（assets/images/categories）の比率に合わせる
    aspectRatio: 2 / 1,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.overlayStrong,
  },
  name: {
    ...typography.display,
    color: colors.textOnDark,
  },
  count: {
    ...typography.captionSmall,
    color: colors.textOnDarkMuted,
  },
});
