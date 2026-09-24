import { Image } from 'expo-image';
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

type PhotoPagerProps = {
  uris: string[];
  /** 各写真の読み上げ用ラベル。指定がなければ「写真 1」のように番号で読む */
  accessibilityLabel?: string;
  onIndexChange: (index: number) => void;
};

/** 親の大きさいっぱいに写真を並べ、横にスライドして1枚ずつ切り替える */
export function PhotoPager({ uris, accessibilityLabel, onIndexChange }: PhotoPagerProps) {
  const [pageWidth, setPageWidth] = useState(0);

  const handleLayout = (event: LayoutChangeEvent) => setPageWidth(event.nativeEvent.layout.width);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (pageWidth === 0) return;
    onIndexChange(Math.round(event.nativeEvent.contentOffset.x / pageWidth));
  };

  return (
    <View style={StyleSheet.absoluteFill} onLayout={handleLayout}>
      <ScrollView
        horizontal
        pagingEnabled
        scrollEnabled={uris.length > 1}
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {uris.map((uri, index) => (
          <Image
            key={`${index}-${uri}`}
            source={{ uri }}
            accessibilityLabel={`${accessibilityLabel ?? '写真'} ${index + 1}/${uris.length}`}
            contentFit="cover"
            transition={200}
            style={[styles.page, { width: pageWidth }]}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    height: '100%',
  },
});
