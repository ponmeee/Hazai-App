import type { QueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/api/queryKeys';
import type { Message } from '@/types/models';

/**
 * 送信者自身にも WebSocket で同じメッセージが届くため、REST の応答と重複しないよう ID で除外して追加する。
 */
export function addMessageToCache(queryClient: QueryClient, message: Message): void {
  queryClient.setQueryData<Message[]>(queryKeys.viewer.messages(message.conversationId), (current) =>
    current === undefined || current.some((existing) => existing.id === message.id)
      ? current
      : [...current, message],
  );
  void queryClient.invalidateQueries({ queryKey: queryKeys.viewer.conversations, exact: true });
}
