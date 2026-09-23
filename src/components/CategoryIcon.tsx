import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Link } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';
import type { Category, CategorySlug } from '@/types/models';

type MaterialIconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

const categoryIconNames: Record<CategorySlug, MaterialIconName> = {
  wood: 'pine-tree',
  glass: 'glass-fragile',
  fabric: 'tshirt-crew-outline',
  acrylic: 'cube-outline',
  leather: 'wallet-outline',
  metal: 'nut',
  paper: 'note-outline',
  other: 'dots-horizontal',
};

type CategoryIconProps = {
  category: Category;
};

export function CategoryIcon({ category }: CategoryIconProps) {
  return (
    <Link
      href={{ pathname: '/category/[category]', params: { category: category.slug } }}
      asChild
    >
      <Pressable accessibilityLabel={category.name}>
        {({ pressed }) => (
          <View style={[styles.container, pressed && styles.pressed]}>
            <View style={styles.circle}>
              <MaterialCommunityIcons
                name={categoryIconNames[category.slug]}
                size={26}
                color={colors.accent}
              />
            </View>
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
    gap: spacing.xs,
  },
  pressed: {
    opacity: 0.6,
  },
  circle: {
    width: 60,
    height: 60,
    borderRadius: radius.full,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...typography.caption,
    color: colors.textPrimary,
  },
});
