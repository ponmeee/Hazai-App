import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/api/queryKeys';
import { useAuth } from '@/features/auth/AuthProvider';

import { fetchConversation, fetchConversations, fetchMessages, sendMessage, startConversation } from './api';
import { addMessageToCache } from './cache';

export const useConversations = () => {
  const { status } = useAuth();
  return useQuery({
    queryKey: queryKeys.viewer.conversations,
    queryFn: fetchConversations,
    enabled: status === 'signedIn',
  });
};

export const useConversation = (id: string) => {
  const { status } = useAuth();
  return useQuery({
    queryKey: queryKeys.viewer.conversation(id),
    queryFn: () => fetchConversation(id),
    enabled: status === 'signedIn',
  });
};

export const useMessages = (conversationId: string) => {
  const { status } = useAuth();
  return useQuery({
    queryKey: queryKeys.viewer.messages(conversationId),
    queryFn: () => fetchMessages(conversationId),
    enabled: status === 'signedIn',
  });
};

export const useSendMessage = (conversationId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => sendMessage(conversationId, body),
    onSuccess: (message) => addMessageToCache(queryClient, message),
  });
};

export const useStartConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, productId }: { userId: string; productId: string | null }) =>
      startConversation(userId, productId),
    onSuccess: (conversation) => {
      queryClient.setQueryData(queryKeys.viewer.conversation(conversation.id), conversation);
      void queryClient.invalidateQueries({ queryKey: queryKeys.viewer.conversations, exact: true });
    },
  });
};
