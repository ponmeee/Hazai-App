import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fontWeights, spacing, typography } from '@/theme';

// デザインの画像枠（幅 402 × 高さ 162）の比率
const HERO_ASPECT_RATIO = 402 / 162;

export function HomeHero() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../../../assets/images/home/hero.jpg')}
        contentFit="cover"
        transition={200}
        style={styles.image}
      />
      <View style={styles.overlay}>
        <Text style={styles.copy}>{'使いきれなかった素材を\n必要としている誰かへ。'}</Text>
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
    aspectRatio: HERO_ASPECT_RATIO,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    backgroundColor: colors.overlayStrong,
  },
  copy: {
    ...typography.input,
    ...fontWeights.semiBold,
    color: colors.textOnDark,
  },
});
