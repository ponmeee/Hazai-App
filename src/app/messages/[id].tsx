import { useLocalSearchParams } from 'expo-router';
import { useRef } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';

import { getErrorMessage } from '@/api/client';
import { EmptyState } from '@/components/EmptyState';
import { Header } from '@/components/Header';
import { QueryView } from '@/components/QueryView';
import { Screen } from '@/components/Screen';
import { RequireAuth } from '@/features/auth/components/RequireAuth';
import { ConversationProductBanner } from '@/features/messages/components/ConversationProductBanner';
import { MessageBubble } from '@/features/messages/components/MessageBubble';
import { MessageComposer } from '@/features/messages/components/MessageComposer';
import { useConversation, useMessages, useSendMessage } from '@/features/messages/hooks';
import { colors, layout, spacing, typography } from '@/theme';
import type { Account, Message } from '@/types/models';

type ChatProps = {
  conversationId: string;
  account: Account;
};

function Chat({ conversationId, account }: ChatProps) {
  const conversationQuery = useConversation(conversationId);
  const messagesQuery = useMessages(conversationId);
  const sendMessage = useSendMessage(conversationId);
  const listRef = useRef<FlatList<Message>>(null);

  const product = conversationQuery.data?.product ?? null;

  const send = async (body: string): Promise<boolean> => {
    try {
      await sendMessage.mutateAsync(body);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {product !== null && <ConversationProductBanner product={product} />}
      <View style={styles.flex}>
        <QueryView query={messagesQuery}>
          {(messages) => (
            <FlatList
              ref={listRef}
              data={messages}
              keyExtractor={(message) => message.id}
              renderItem={({ item }) => <MessageBubble message={item} isMine={item.senderId === account.id} />}
              contentContainerStyle={styles.messages}
              onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
              ListEmptyComponent={<EmptyState title="最初のメッセージを送ってみましょう" />}
            />
          )}
        </QueryView>
      </View>
      {sendMessage.isError && <Text style={styles.sendError}>{getErrorMessage(sendMessage.error)}</Text>}
      <MessageComposer isSending={sendMessage.isPending} onSend={send} />
    </KeyboardAvoidingView>
  );
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const conversationQuery = useConversation(id);

  return (
    <Screen edges={['top', 'bottom']}>
      <Header showBack title={conversationQuery.data?.otherUser.name ?? 'メッセージ'} />
      <RequireAuth description="メッセージを見るにはログインしてください。">
        {(account) => <Chat conversationId={id} account={account} />}
      </RequireAuth>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  messages: {
    gap: spacing.md,
    paddingHorizontal: layout.screenPaddingX,
    paddingVertical: spacing.lg,
  },
  sendError: {
    ...typography.caption,
    color: colors.danger,
    textAlign: 'center',
    paddingVertical: spacing.xs,
  },
});
