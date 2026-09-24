import { FlatList, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { Header } from '@/components/Header';
import { QueryView } from '@/components/QueryView';
import { Screen } from '@/components/Screen';
import { RequireAuth } from '@/features/auth/components/RequireAuth';
import { ConversationListItem } from '@/features/messages/components/ConversationListItem';
import { useConversations } from '@/features/messages/hooks';
import { colors, layout } from '@/theme';
import type { Account } from '@/types/models';

function ConversationList({ account }: { account: Account }) {
  const conversationsQuery = useConversations();

  return (
    <QueryView query={conversationsQuery}>
      {(conversations) => (
        <FlatList
          data={conversations}
          keyExtractor={(conversation) => conversation.id}
          renderItem={({ item }) => <ConversationListItem conversation={item} viewerId={account.id} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <EmptyState
              title="メッセージはまだありません"
              description="商品ページの「出品者へ問い合わせる」から会話を始められます。"
            />
          }
        />
      )}
    </QueryView>
  );
}

export default function MessagesScreen() {
  return (
    <Screen>
      <Header showBack title="メッセージ" />
      <RequireAuth description="メッセージを見るにはログインしてください。">
        {(account) => <ConversationList account={account} />}
      </RequireAuth>
    </Screen>
  );
}

const styles = StyleSheet.create({
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: layout.screenPaddingX + 48 + 12,
    backgroundColor: colors.divider,
  },
});
