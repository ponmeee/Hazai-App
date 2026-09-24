import { router, useLocalSearchParams } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { getErrorMessage } from '@/api/errors';
import { EmptyState } from '@/components/EmptyState';
import { GalleryPostCard } from '@/components/GalleryPostCard';
import { Header } from '@/components/Header';
import { Notice } from '@/components/Notice';
import { OwnerActionBar } from '@/components/OwnerActionBar';
import { PrimaryButton } from '@/components/PrimaryButton';
import { QueryView } from '@/components/QueryView';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/features/auth/AuthProvider';
import { CommentRow } from '@/features/gallery/components/CommentRow';
import {
  useAddComment,
  useComments,
  useDeleteComment,
  useDeleteGalleryPost,
  useGalleryPost,
} from '@/features/gallery/hooks';
import { MessageComposer } from '@/features/messages/components/MessageComposer';
import { useTransientMessage } from '@/hooks/useTransientMessage';
import { colors, layout, spacing, typography } from '@/theme';
import type { GalleryPost } from '@/types/models';
import { goBackOr } from '@/utils/navigation';

const COMMENT_MAX_LENGTH = 500;

function PostDetail({ post }: { post: GalleryPost }) {
  const { status, account } = useAuth();
  const isOwnPost = account?.id === post.author.id;

  const commentsQuery = useComments(post.id);
  const addComment = useAddComment(post.id);
  const deleteComment = useDeleteComment(post.id);
  const deletePost = useDeleteGalleryPost();
  const [notice, showNotice] = useTransientMessage();

  const sendComment = async (body: string): Promise<boolean> => {
    try {
      await addComment.mutateAsync(body);
      return true;
    } catch (error) {
      showNotice(getErrorMessage(error));
      return false;
    }
  };

  const removePost = () => {
    deletePost.mutate(post.id, {
      onSuccess: () => goBackOr('/mypage'),
      onError: (error) => showNotice(getErrorMessage(error)),
    });
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <GalleryPostCard
          post={post}
          linkToDetail={false}
          onLikeError={(error) => showNotice(getErrorMessage(error))}
        />

        {isOwnPost && (
          <OwnerActionBar
            note="あなたが投稿した作品です"
            deleteLabel="作品を削除する"
            isDeleting={deletePost.isPending}
            onDelete={removePost}
            style={styles.ownerActions}
          />
        )}

        <View style={styles.comments}>
          <Text style={styles.sectionTitle}>コメント（{post.commentCount}）</Text>
          <QueryView query={commentsQuery}>
            {(comments) =>
              comments.length === 0 ? (
                <EmptyState title="まだコメントはありません" description="最初のコメントを書いてみましょう。" />
              ) : (
                comments.map((comment) => (
                  <CommentRow
                    key={comment.id}
                    comment={comment}
                    canDelete={account?.id === comment.author.id || isOwnPost}
                    isDeleting={deleteComment.isPending && deleteComment.variables === comment.id}
                    onDelete={() =>
                      deleteComment.mutate(comment.id, { onError: (error) => showNotice(getErrorMessage(error)) })
                    }
                  />
                ))
              )
            }
          </QueryView>
        </View>
      </ScrollView>

      {notice !== null && (
        <View style={styles.noticeContainer}>
          <Notice message={notice} />
        </View>
      )}
      {status === 'signedIn' ? (
        <MessageComposer
          isSending={addComment.isPending}
          onSend={sendComment}
          placeholder="コメントを入力"
          maxLength={COMMENT_MAX_LENGTH}
        />
      ) : (
        <View style={styles.signInFooter}>
          <PrimaryButton label="ログインしてコメントする" variant="secondary" onPress={() => router.push('/login')} />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

export default function GalleryPostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const postQuery = useGalleryPost(id);

  return (
    <Screen edges={['top', 'bottom']}>
      <Header showBack title="作品" />
      <QueryView query={postQuery}>{(post) => <PostDetail post={post} />}</QueryView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    gap: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  ownerActions: {
    paddingHorizontal: layout.screenPaddingX,
  },
  comments: {
    gap: spacing.xs,
  },
  sectionTitle: {
    ...typography.heading,
    color: colors.textPrimary,
    paddingHorizontal: layout.screenPaddingX,
  },
  noticeContainer: {
    alignItems: 'center',
    paddingBottom: spacing.sm,
    pointerEvents: 'none',
  },
  signInFooter: {
    paddingHorizontal: layout.screenPaddingX,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
