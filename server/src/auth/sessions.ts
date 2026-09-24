import { createHash, randomBytes } from 'node:crypto';

import { config } from '../config.ts';
import { execute, nowIso, queryOne } from '../db/database.ts';

// DB が漏れてもトークンをそのまま使われないよう、保存するのはハッシュのみ
const hashToken = (token: string): string => createHash('sha256').update(token).digest('hex');

export function createSession(userId: string): string {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + config.sessionTtlDays * 24 * 60 * 60 * 1000).toISOString();
  execute(
    `INSERT INTO sessions (token_hash, user_id, created_at, expires_at)
     VALUES (:tokenHash, :userId, :createdAt, :expiresAt)`,
    { tokenHash: hashToken(token), userId, createdAt: nowIso(), expiresAt },
  );
  return token;
}

export function findUserIdBySessionToken(token: string): string | null {
  const tokenHash = hashToken(token);
  const session = queryOne<{ user_id: string; expires_at: string }>(
    'SELECT user_id, expires_at FROM sessions WHERE token_hash = :tokenHash',
    { tokenHash },
  );
  if (session === undefined) return null;
  if (session.expires_at <= nowIso()) {
    deleteSession(token);
    return null;
  }
  return session.user_id;
}

export function deleteSession(token: string): void {
  execute('DELETE FROM sessions WHERE token_hash = :tokenHash', { tokenHash: hashToken(token) });
}

export const readBearerToken = (authorization: string | undefined): string | null =>
  authorization?.startsWith('Bearer ') ? authorization.slice('Bearer '.length) : null;
