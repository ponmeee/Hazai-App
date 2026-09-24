import { Hono } from 'hono';
import { z } from 'zod';

import { requireAuth } from '../auth/middleware.ts';
import { badRequest, notFound, parseJsonBody, type AppEnv } from '../http.ts';
import { publishToUsers } from '../realtime/hub.ts';
import {
  findConversationForViewer,
  findOrCreateConversation,
  insertMessage,
  isParticipant,
  listConversations,
  listMessages,
  listParticipantIds,
} from '../repositories/conversations.ts';
import { productExists } from '../repositories/products.ts';
import { userExists } from '../repositories/users.ts';

const startSchema = z.object({
  userId: z.string().min(1),
  productId: z.string().min(1).nullable().default(null),
});

const messageSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, 'メッセージを入力してください')
    .max(1000, 'メッセージは1000文字以内で入力してください'),
});

// 参加者以外には存在自体を知らせないよう、権限がない場合も 404 を返す
const requireParticipant = (conversationId: string, userId: string) => {
  if (!isParticipant(conversationId, userId)) throw notFound('会話が見つかりません');
};

export const conversationRoutes = new Hono<AppEnv>()
  .use(requireAuth)
  .get('/', (c) => c.json(listConversations(c.get('userId'))))
  .post('/', async (c) => {
    const viewerId = c.get('userId');
    const input = await parseJsonBody(c, startSchema);
    if (input.userId === viewerId) throw badRequest('自分自身とは会話できません');
    if (!userExists(input.userId)) throw notFound('ユーザーが見つかりません');
    if (input.productId !== null && !productExists(input.productId)) throw notFound('商品が見つかりません');

    const id = findOrCreateConversation(viewerId, input.userId, input.productId);
    return c.json(findConversationForViewer(id, viewerId));
  })
  .get('/:id', (c) => {
    const conversation = findConversationForViewer(c.req.param('id'), c.get('userId'));
    if (conversation === undefined) throw notFound('会話が見つかりません');
    return c.json(conversation);
  })
  .get('/:id/messages', (c) => {
    const conversationId = c.req.param('id');
    requireParticipant(conversationId, c.get('userId'));
    return c.json(listMessages(conversationId));
  })
  .post('/:id/messages', async (c) => {
    const conversationId = c.req.param('id');
    const senderId = c.get('userId');
    requireParticipant(conversationId, senderId);
    const { body } = await parseJsonBody(c, messageSchema);

    const message = insertMessage(conversationId, senderId, body);
    publishToUsers(listParticipantIds(conversationId), { type: 'message.created', message });
    return c.json(message, 201);
  });
