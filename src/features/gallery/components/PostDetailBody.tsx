import { ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { getErrorMessage } from '@/api/errors';
import { EmptyState } from '@/components/EmptyState';
import { GalleryPostCard } from '@/components/GalleryPostCard';
import { OwnerActionBar } from '@/components/OwnerActionBar';
import { QueryView } from '@/components/QueryView';
import { useAuth } from '@/features/auth/AuthProvider';
import { colors, layout, spacing, typography } from '@/theme';
import type { GalleryPost } from '@/types/models';
import { goBackOr } from '@/utils/navigation';

import { useComments, useDeleteComment, useDeleteGalleryPost } from '../hooks';
import { CommentRow } from './CommentRow';
import { PostMaterialsSection } from './PostMaterialsSection';

type PostDetailBodyProps = {
  post: GalleryPost;
  onNotice: (message: string) => void;
  style?: StyleProp<ViewStyle>;
};

/** 作品詳細の縦にスクロールする本文（作品カード・使った端材・コメント） */
export function PostDetailBody({ post, onNotice, style }: PostDetailBodyProps) {
  const { account } = useAuth();
  const isOwnPost = account?.id === post.author.id;

  const commentsQuery = useComments(post.id);
  const deleteComment = useDeleteComment(post.id);
  const deletePost = useDeleteGalleryPost();
  const showError = (error: unknown) => onNotice(getErrorMessage(error));

  const removePost = () => {
    deletePost.mutate(post.id, { onSuccess: () => goBackOr('/mypage'), onError: showError });
  };

  return (
    <ScrollView style={style} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <GalleryPostCard post={post} linkToDetail={false} onLikeError={showError} />

      {isOwnPost && (
        <OwnerActionBar
          note="あなたが投稿した作品です"
          deleteLabel="作品を削除する"
          isDeleting={deletePost.isPending}
          onDelete={removePost}
          style={styles.ownerActions}
        />
      )}

      <PostMaterialsSection postId={post.id} />

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
                  onDelete={() => deleteComment.mutate(comment.id, { onError: showError })}
                />
              ))
            )
          }
        </QueryView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
});
