import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useAuth } from '@/features/auth/AuthProvider';

import { addMessageToCache } from './cache';
import { subscribeToMessages } from './realtime';

/** ログイン中は常に1本だけ購読し、届いたメッセージをキャッシュへ反映する */
export function RealtimeMessageSync() {
  const queryClient = useQueryClient();
  const { account } = useAuth();
  const accountId = account?.id;

  useEffect(() => {
    if (accountId === undefined) return;
    return subscribeToMessages(accountId, {
      onMessage: (message) => addMessageToCache(queryClient, message),
    });
  }, [accountId, queryClient]);

  return null;
}
