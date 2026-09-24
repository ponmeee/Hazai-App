import { AppError, unwrap } from '@/api/errors';
import { MESSAGE_COLUMNS, toConversation, toMessage } from '@/api/mappers';
import { supabase } from '@/lib/supabase/client';
import type { Conversation, Message } from '@/types/models';

/** 自分が参加している会話（相手・商品・最後のメッセージ付き）。DB 関数が RLS を適用して返す */
export async function fetchConversations(): Promise<Conversation[]> {
  return unwrap(await supabase.rpc('get_my_conversations')).map(toConversation);
}

export async function fetchConversation(id: string): Promise<Conversation> {
  const [row] = unwrap(await supabase.rpc('get_my_conversations', { p_conversation_id: id }));
  if (row === undefined) throw new AppError('会話が見つかりません');
  return toConversation(row);
}

/** 同じ相手・同じ商品の会話が既にあればそれが返る。参加者の追加は DB 関数の中でのみ行う */
export async function startConversation(userId: string, productId: string | null): Promise<Conversation> {
  const id = unwrap(await supabase.rpc('start_conversation', { p_other_user_id: userId, p_listing_id: productId }));
  return fetchConversation(id);
}

export async function fetchMessages(conversationId: string): Promise<Message[]> {
  const rows = unwrap(
    await supabase
      .from('messages')
      .select(MESSAGE_COLUMNS)
      .eq('conversation_id', conversationId)
      .order('created_at')
      .order('id'),
  );
  return rows.map(toMessage);
}

/** 送信者は DB の既定値（auth.uid()）で決まるため送らない */
export async function sendMessage(conversationId: string, body: string): Promise<Message> {
  return toMessage(
    unwrap(
      await supabase
        .from('messages')
        .insert({ conversation_id: conversationId, content: body })
        .select(MESSAGE_COLUMNS)
        .single(),
    ),
  );
}
