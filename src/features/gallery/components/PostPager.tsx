import { useEffect, useRef, useState } from 'react';
import { FlatList, StyleSheet, View, type LayoutChangeEvent, type ViewToken } from 'react-native';

import type { GalleryPost } from '@/types/models';

import { PostDetailBody } from './PostDetailBody';

type PostPagerProps = {
  posts: GalleryPost[];
  initialIndex: number;
  onChangePost: (post: GalleryPost) => void;
  onNotice: (message: string) => void;
};

// 半分以上見えている作品を「表示中」とみなす
const VIEWABILITY_CONFIG = { itemVisiblePercentThreshold: 60 };

/**
 * 作品を 1 件ずつ横に並べ、左右のスライドで前後の作品へ移る。
 * 写真の上のスライドは写真の切り替え（PhotoPager）が受け取るため、作品の切り替えは写真以外の場所で行う。
 */
export function PostPager({ posts, initialIndex, onChangePost, onNotice }: PostPagerProps) {
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  // FlatList は onViewableItemsChanged の差し替えに対応しないため、同じ関数を使い続け、最新の処理は ref 経由で呼ぶ
  const onChangePostRef = useRef(onChangePost);
  useEffect(() => {
    onChangePostRef.current = onChangePost;
  }, [onChangePost]);
  const [handleViewableItemsChanged] = useState(
    () =>
      ({ viewableItems }: { viewableItems: ViewToken<GalleryPost>[] }) => {
        const visible = viewableItems[0]?.item;
        if (visible !== undefined) onChangePostRef.current(visible);
      },
  );

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize((current) => (current?.width === width && current.height === height ? current : { width, height }));
  };

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {size !== null && (
        <FlatList
          data={posts}
          keyExtractor={(post) => post.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          getItemLayout={(_, index) => ({ length: size.width, offset: size.width * index, index })}
          initialNumToRender={1}
          windowSize={3}
          viewabilityConfig={VIEWABILITY_CONFIG}
          onViewableItemsChanged={handleViewableItemsChanged}
          renderItem={({ item }) => (
            <PostDetailBody post={item} onNotice={onNotice} style={{ width: size.width, height: size.height }} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
