import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { getAuthToken } from '@/api/client';
import { useAuth } from '@/features/auth/AuthProvider';

import { addMessageToCache } from './cache';
import { subscribeToMessages } from './realtime';

/** ログイン中は常に1本だけ接続し、届いたメッセージをキャッシュへ反映する */
export function RealtimeMessageSync() {
  const queryClient = useQueryClient();
  const { status, account } = useAuth();
  const accountId = account?.id;

  useEffect(() => {
    const token = getAuthToken();
    if (status !== 'signedIn' || token === null) return;
    return subscribeToMessages(token, {
      onMessage: (message) => addMessageToCache(queryClient, message),
    });
  }, [status, accountId, queryClient]);

  return null;
}
