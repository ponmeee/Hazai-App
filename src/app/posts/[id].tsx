import { router, useLocalSearchParams } from 'expo-router';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { Header } from '@/components/Header';
import { LoadingState } from '@/components/LoadingState';
import { Notice } from '@/components/Notice';
import { QueryView } from '@/components/QueryView';
import { Screen } from '@/components/Screen';
import { CommentFooter } from '@/features/gallery/components/CommentFooter';
import { PostDetailBody } from '@/features/gallery/components/PostDetailBody';
import { PostPager } from '@/features/gallery/components/PostPager';
import { useGalleryPost, useGalleryPosts } from '@/features/gallery/hooks';
import { parsePostFeed } from '@/features/gallery/navigation';
import { useTransientMessage } from '@/hooks/useTransientMessage';
import { spacing } from '@/theme';

type PostScreenParams = { id: string; category?: string; authorId?: string };

/** 開いた元の一覧に含まれない作品（関連作品から開いた場合など）は、その作品だけを表示する */
function SinglePost({ postId, onNotice }: { postId: string; onNotice: (message: string) => void }) {
  const postQuery = useGalleryPost(postId);
  return (
    <QueryView query={postQuery}>{(post) => <PostDetailBody post={post} onNotice={onNotice} style={styles.flex} />}</QueryView>
  );
}

export default function GalleryPostScreen() {
  const params = useLocalSearchParams<PostScreenParams>();
  const postId = params.id;
  const feedQuery = useGalleryPosts(parsePostFeed(params));
  const [notice, showNotice] = useTransientMessage();

  const feedPosts = feedQuery.data ?? [];
  const initialIndex = feedPosts.findIndex((post) => post.id === postId);

  const renderBody = () => {
    // 一覧の読み込みを待ってから、前後にスライドできる形で表示する
    if (feedQuery.isPending) return <LoadingState />;
    if (initialIndex === -1) return <SinglePost postId={postId} onNotice={showNotice} />;
    return (
      <PostPager
        posts={feedPosts}
        initialIndex={initialIndex}
        // URL を表示中の作品に合わせ、共有・再読み込みでも同じ作品を開けるようにする
        onChangePost={(post) => {
          if (post.id !== postId) router.setParams({ id: post.id });
        }}
        onNotice={showNotice}
      />
    );
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <Header showBack title="作品" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {renderBody()}
        {notice !== null && (
          <View style={styles.noticeContainer}>
            <Notice message={notice} />
          </View>
        )}
        <CommentFooter postId={postId} onNotice={showNotice} />
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  noticeContainer: {
    alignItems: 'center',
    paddingBottom: spacing.sm,
    pointerEvents: 'none',
  },
});
