import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';
import type { Category } from '@/types/models';

type CategoryIconProps = {
  category: Category;
};

const THUMBNAIL_SIZE = 60;

export function CategoryIcon({ category }: CategoryIconProps) {
  return (
    <Link href={{ pathname: '/category/[category]', params: { category: category.slug } }} asChild>
      <Pressable accessibilityLabel={category.name}>
        {({ pressed }) => (
          <View style={[styles.container, pressed && styles.pressed]}>
            <Image source={category.thumbnail} contentFit="cover" style={styles.thumbnail} />
            <Text style={styles.label}>{category.name}</Text>
          </View>
        )}
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.xxs,
  },
  pressed: {
    opacity: 0.6,
  },
  thumbnail: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
  },
  label: {
    ...typography.captionSmall,
    color: colors.textPrimary,
  },
});
