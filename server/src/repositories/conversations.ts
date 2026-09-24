import { randomUUID } from 'node:crypto';

import { execute, nowIso, queryAll, queryOne, transaction } from '../db/database.ts';
import type { ConversationDto, MessageDto } from '../dto.ts';
import { toUserSummary, userSummaryColumns, type UserSummaryRow } from './userColumns.ts';

type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

type ConversationRow = UserSummaryRow & {
  id: string;
  updated_at: string;
  product_id: string | null;
  product_name: string | null;
  product_price: number | null;
  product_image_urls: string | null;
  last_id: string | null;
  last_sender_id: string | null;
  last_body: string | null;
  last_created_at: string | null;
};

const toMessage = (row: MessageRow): MessageDto => ({
  id: row.id,
  conversationId: row.conversation_id,
  senderId: row.sender_id,
  body: row.body,
  createdAt: row.created_at,
});

const toConversation = (row: ConversationRow): ConversationDto => ({
  id: row.id,
  otherUser: toUserSummary(row),
  product:
    row.product_id === null || row.product_name === null || row.product_price === null
      ? null
      : {
          id: row.product_id,
          name: row.product_name,
          price: row.product_price,
          imageUrl: (JSON.parse(row.product_image_urls ?? '[]') as string[])[0] ?? null,
        },
  lastMessage:
    row.last_id === null || row.last_sender_id === null || row.last_body === null || row.last_created_at === null
      ? null
      : {
          id: row.last_id,
          conversationId: row.id,
          senderId: row.last_sender_id,
          body: row.last_body,
          createdAt: row.last_created_at,
        },
  updatedAt: row.updated_at,
});

// 1対1の会話を前提に、閲覧者から見た「相手」を JOIN して一覧・詳細で共通に使う
const CONVERSATION_SELECT = `
  SELECT c.id, c.updated_at, c.product_id,
    p.name AS product_name, p.price AS product_price, p.image_urls AS product_image_urls,
    ${userSummaryColumns('other')},
    m.id AS last_id, m.sender_id AS last_sender_id, m.body AS last_body, m.created_at AS last_created_at
  FROM conversation_participants me
  JOIN conversations c ON c.id = me.conversation_id
  JOIN conversation_participants op ON op.conversation_id = c.id AND op.user_id <> me.user_id
  JOIN users other ON other.id = op.user_id
  LEFT JOIN products p ON p.id = c.product_id
  LEFT JOIN messages m ON m.id = (
    SELECT id FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC, rowid DESC LIMIT 1
  )
  WHERE me.user_id = :viewerId`;

export const listConversations = (viewerId: string): ConversationDto[] =>
  queryAll<ConversationRow>(`${CONVERSATION_SELECT} ORDER BY c.updated_at DESC`, { viewerId }).map(
    toConversation,
  );

/** 参加者でなければ undefined を返すため、権限確認も兼ねる */
export function findConversationForViewer(id: string, viewerId: string): ConversationDto | undefined {
  const row = queryOne<ConversationRow>(`${CONVERSATION_SELECT} AND c.id = :id`, { id, viewerId });
  return row === undefined ? undefined : toConversation(row);
}

export const isParticipant = (conversationId: string, userId: string): boolean =>
  queryOne(
    'SELECT 1 FROM conversation_participants WHERE conversation_id = :conversationId AND user_id = :userId',
    { conversationId, userId },
  ) !== undefined;

export const listParticipantIds = (conversationId: string): string[] =>
  queryAll<{ user_id: string }>(
    'SELECT user_id FROM conversation_participants WHERE conversation_id = :conversationId',
    { conversationId },
  ).map((row) => row.user_id);

/** 同じ相手・同じ商品についての会話があればそれを返し、なければ作る */
export function findOrCreateConversation(userId: string, otherUserId: string, productId: string | null): string {
  return transaction(() => {
    const existing = queryOne<{ id: string }>(
      `SELECT c.id FROM conversations c
       JOIN conversation_participants a ON a.conversation_id = c.id AND a.user_id = :userId
       JOIN conversation_participants b ON b.conversation_id = c.id AND b.user_id = :otherUserId
       WHERE c.product_id IS :productId
       LIMIT 1`,
      { userId, otherUserId, productId },
    );
    if (existing !== undefined) return existing.id;

    const id = randomUUID();
    const now = nowIso();
    execute(
      'INSERT INTO conversations (id, product_id, created_at, updated_at) VALUES (:id, :productId, :now, :now)',
      { id, productId, now },
    );
    for (const participantId of [userId, otherUserId]) {
      execute(
        'INSERT INTO conversation_participants (conversation_id, user_id) VALUES (:id, :participantId)',
        { id, participantId },
      );
    }
    return id;
  });
}

export const listMessages = (conversationId: string): MessageDto[] =>
  queryAll<MessageRow>(
    'SELECT * FROM messages WHERE conversation_id = :conversationId ORDER BY created_at, rowid',
    { conversationId },
  ).map(toMessage);

export function insertMessage(
  conversationId: string,
  senderId: string,
  body: string,
  createdAt: string = nowIso(),
): MessageDto {
  const message: MessageRow = {
    id: randomUUID(),
    conversation_id: conversationId,
    sender_id: senderId,
    body,
    created_at: createdAt,
  };
  transaction(() => {
    execute(
      `INSERT INTO messages (id, conversation_id, sender_id, body, created_at)
       VALUES (:id, :conversation_id, :sender_id, :body, :created_at)`,
      message,
    );
    execute('UPDATE conversations SET updated_at = :createdAt WHERE id = :conversationId', {
      createdAt,
      conversationId,
    });
  });
  return toMessage(message);
}
