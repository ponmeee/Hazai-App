import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { colors, layout, radius, spacing } from '@/theme';

type ProductImageViewerProps = {
  imageUrls: string[];
  productName: string;
};

export function ProductImageViewer({ imageUrls, productName }: ProductImageViewerProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: imageUrls[selectedIndex] }}
        accessibilityLabel={productName}
        contentFit="cover"
        transition={150}
        style={styles.mainImage}
      />
      {imageUrls.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbnails}>
          {imageUrls.map((url, index) => (
            <Pressable
              key={url}
              onPress={() => setSelectedIndex(index)}
              accessibilityRole="button"
              accessibilityLabel={`画像 ${index + 1}`}
              accessibilityState={{ selected: index === selectedIndex }}
            >
              <Image
                source={{ uri: url }}
                contentFit="cover"
                style={[styles.thumbnail, index === selectedIndex && styles.thumbnailSelected]}
              />
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  mainImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.surface,
  },
  thumbnails: {
    gap: spacing.sm,
    paddingHorizontal: layout.screenPaddingX,
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: colors.surface,
  },
  thumbnailSelected: {
    borderColor: colors.textPrimary,
  },
});
