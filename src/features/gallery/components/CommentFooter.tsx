import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { getErrorMessage } from '@/api/errors';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useAuth } from '@/features/auth/AuthProvider';
import { MessageComposer } from '@/features/messages/components/MessageComposer';
import { colors, layout, spacing } from '@/theme';

import { useAddComment } from '../hooks';

const COMMENT_MAX_LENGTH = 500;

type CommentFooterProps = {
  postId: string;
  onNotice: (message: string) => void;
};

/** 作品詳細の下に固定するコメント入力。未ログインならログインへの導線 */
export function CommentFooter({ postId, onNotice }: CommentFooterProps) {
  const { status } = useAuth();
  const addComment = useAddComment(postId);

  const sendComment = async (body: string): Promise<boolean> => {
    try {
      await addComment.mutateAsync(body);
      return true;
    } catch (error) {
      onNotice(getErrorMessage(error));
      return false;
    }
  };

  if (status !== 'signedIn') {
    return (
      <View style={styles.signInFooter}>
        <PrimaryButton label="ログインしてコメントする" variant="secondary" onPress={() => router.push('/login')} />
      </View>
    );
  }

  return (
    <MessageComposer
      isSending={addComment.isPending}
      onSend={sendComment}
      placeholder="コメントを入力"
      maxLength={COMMENT_MAX_LENGTH}
    />
  );
}

const styles = StyleSheet.create({
  signInFooter: {
    paddingHorizontal: layout.screenPaddingX,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
