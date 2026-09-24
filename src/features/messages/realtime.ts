import { toMessage } from '@/api/mappers';
import { supabase } from '@/lib/supabase/client';
import type { Tables } from '@/lib/supabase/database.types';
import type { Message } from '@/types/models';

type Handlers = {
  onMessage: (message: Message) => void;
};

/**
 * 新着メッセージを Supabase Realtime で受け取る。
 * postgres_changes は RLS を適用して配信されるため、自分が参加している会話のメッセージだけが届く。
 * 切断時の再接続は supabase-js が行う。
 */
export function subscribeToMessages(channelKey: string, { onMessage }: Handlers): () => void {
  const channel = supabase
    .channel(`messages:${channelKey}`)
    .on<Tables<'messages'>>(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages' },
      (payload) => onMessage(toMessage(payload.new)),
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
