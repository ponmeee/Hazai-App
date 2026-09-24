import { upgradeWebSocket } from '@hono/node-server';
import type { WSContext } from 'hono/ws';
import { z } from 'zod';

import { findUserIdBySessionToken } from '../auth/sessions.ts';
import type { RealtimeEventDto } from '../dto.ts';

const AUTH_TIMEOUT_MS = 10_000;
const CLOSE_UNAUTHORIZED = 4401;

const socketsByUser = new Map<string, Set<WSContext>>();

const authMessageSchema = z.object({ type: z.literal('auth'), token: z.string() });

const send = (socket: WSContext, event: RealtimeEventDto) => socket.send(JSON.stringify(event));

export function publishToUsers(userIds: string[], event: RealtimeEventDto): void {
  for (const userId of userIds) {
    for (const socket of socketsByUser.get(userId) ?? []) {
      send(socket, event);
    }
  }
}

/**
 * トークンを URL に載せるとログに残るため、接続後の最初のメッセージで認証する。
 * クライアント → サーバーの送信は認証のみで、メッセージ送信は REST で行う。
 */
export const realtimeHandler = upgradeWebSocket(() => {
  let userId: string | null = null;
  let authTimer: ReturnType<typeof setTimeout> | undefined;

  const unregister = (socket: WSContext) => {
    if (userId === null) return;
    const sockets = socketsByUser.get(userId);
    sockets?.delete(socket);
    if (sockets?.size === 0) socketsByUser.delete(userId);
  };

  return {
    onOpen(_event, socket) {
      authTimer = setTimeout(() => socket.close(CLOSE_UNAUTHORIZED, 'auth timeout'), AUTH_TIMEOUT_MS);
    },
    onMessage(event, socket) {
      if (userId !== null) return;
      let parsed: unknown;
      try {
        parsed = JSON.parse(String(event.data));
      } catch {
        parsed = null;
      }
      const message = authMessageSchema.safeParse(parsed);
      const resolvedUserId = message.success ? findUserIdBySessionToken(message.data.token) : null;
      clearTimeout(authTimer);
      if (resolvedUserId === null) {
        socket.close(CLOSE_UNAUTHORIZED, 'unauthorized');
        return;
      }
      userId = resolvedUserId;
      const sockets = socketsByUser.get(userId) ?? new Set<WSContext>();
      sockets.add(socket);
      socketsByUser.set(userId, sockets);
      send(socket, { type: 'ready' });
    },
    onClose(_event, socket) {
      clearTimeout(authTimer);
      unregister(socket);
    },
  };
});
