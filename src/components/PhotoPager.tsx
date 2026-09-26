import { Image } from 'expo-image';
import { useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ViewStyle,
} from 'react-native';

// Web では入れ子の横スクロールが端で外側へ連鎖し、最後の写真からさらにスライドすると前後の作品へ移ってしまうため止める。
// overscroll-behavior は react-native-web だけが解釈し、RN の型定義にはない
const containHorizontalScroll = (Platform.OS === 'web' ? { overscrollBehaviorX: 'contain' } : {}) as ViewStyle;

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
        style={containHorizontalScroll}
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
