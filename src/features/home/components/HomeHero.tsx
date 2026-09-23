import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { colors, layout, radius, spacing, typography } from '@/theme';

type HomeHeroProps = {
  imageUrl: string;
};

export function HomeHero({ imageUrl }: HomeHeroProps) {
  return (
    <View style={styles.container}>
      <Image source={{ uri: imageUrl }} contentFit="cover" transition={200} style={styles.image} />
      <View style={styles.overlay}>
        <Text style={styles.copy}>{'使いきれなかった素材を\n必要としている誰かへ。'}</Text>
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
    aspectRatio: 4 / 3,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
    padding: spacing.xl,
    backgroundColor: colors.overlay,
  },
  copy: {
    ...typography.display,
    color: colors.textOnDark,
  },
});
