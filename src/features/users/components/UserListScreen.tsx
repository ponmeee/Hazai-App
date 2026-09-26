import type { UseQueryResult } from '@tanstack/react-query';
import { FlatList, StyleSheet, View } from 'react-native';

import { getErrorMessage } from '@/api/errors';
import { EmptyState } from '@/components/EmptyState';
import { Header } from '@/components/Header';
import { Notice } from '@/components/Notice';
import { QueryView } from '@/components/QueryView';
import { Screen } from '@/components/Screen';
import { useTransientMessage } from '@/hooks/useTransientMessage';
import { colors, layout, spacing } from '@/theme';
import type { UserSummary } from '@/types/models';

import { UserRow } from './UserRow';

type UserListScreenProps = {
  title: string;
  emptyTitle: string;
  query: UseQueryResult<UserSummary[]>;
};

/** フォロワー・フォロー中の一覧画面の共通部分 */
export function UserListScreen({ title, emptyTitle, query }: UserListScreenProps) {
  const [notice, showNotice] = useTransientMessage();

  return (
    <Screen edges={['top', 'bottom']}>
      <Header showBack title={title} />
      <QueryView query={query}>
        {(users) => (
          <FlatList
            data={users}
            keyExtractor={(user) => user.id}
            renderItem={({ item }) => (
              <UserRow user={item} onFollowError={(error) => showNotice(getErrorMessage(error))} />
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={<EmptyState title={emptyTitle} />}
            contentContainerStyle={styles.content}
          />
        )}
      </QueryView>
      {notice !== null && (
        <View style={styles.noticeContainer}>
          <Notice message={notice} />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxl,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: layout.screenPaddingX,
    backgroundColor: colors.divider,
  },
  noticeContainer: {
    position: 'absolute',
    left: layout.screenPaddingX,
    right: layout.screenPaddingX,
    bottom: spacing.xl,
    pointerEvents: 'none',
  },
});
