import { apiRequest } from '@/api/client';
import type { ConversationDto, MessageDto } from '@/api/dto';
import { toConversation, toMessage } from '@/api/mappers';
import type { Conversation, Message } from '@/types/models';

export const fetchConversations = async (): Promise<Conversation[]> =>
  (await apiRequest<ConversationDto[]>('/conversations')).map(toConversation);

export const fetchConversation = async (id: string): Promise<Conversation> =>
  toConversation(await apiRequest<ConversationDto>(`/conversations/${encodeURIComponent(id)}`));

/** 同じ相手・同じ商品の会話が既にあればそれが返る */
export const startConversation = async (userId: string, productId: string | null): Promise<Conversation> =>
  toConversation(
    await apiRequest<ConversationDto>('/conversations', { method: 'POST', body: { userId, productId } }),
  );

export const fetchMessages = async (conversationId: string): Promise<Message[]> =>
  (await apiRequest<MessageDto[]>(`/conversations/${encodeURIComponent(conversationId)}/messages`)).map(
    toMessage,
  );

export const sendMessage = async (conversationId: string, body: string): Promise<Message> =>
  toMessage(
    await apiRequest<MessageDto>(`/conversations/${encodeURIComponent(conversationId)}/messages`, {
      method: 'POST',
      body: { body },
    }),
  );
