import { Hono } from 'hono';
import { z } from 'zod';

import { requireAuth } from '../auth/middleware.ts';
import { burnPasswordCheck, hashPassword, verifyPassword } from '../auth/password.ts';
import { createSession, deleteSession, readBearerToken } from '../auth/sessions.ts';
import type { AuthResponseDto } from '../dto.ts';
import { conflict, notFound, parseJsonBody, unauthorized, type AppEnv } from '../http.ts';
import { findCredentialsByEmail, getAccount, insertUser } from '../repositories/users.ts';

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email('メールアドレスの形式が正しくありません'));

const registerSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(8, 'パスワードは8文字以上で入力してください')
    .max(128, 'パスワードは128文字以内で入力してください'),
  name: z.string().trim().min(1, '名前を入力してください').max(30, '名前は30文字以内で入力してください'),
  location: z.string().trim().max(30, '地域は30文字以内で入力してください').default(''),
  genre: z.string().trim().max(30, 'ジャンルは30文字以内で入力してください').default(''),
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'パスワードを入力してください'),
});

const authResponse = (userId: string): AuthResponseDto => {
  const account = getAccount(userId);
  if (account === undefined) throw notFound('アカウントが見つかりません');
  return { token: createSession(userId), account };
};

export const authRoutes = new Hono<AppEnv>()
  .post('/register', async (c) => {
    const input = await parseJsonBody(c, registerSchema);
    if (findCredentialsByEmail(input.email) !== undefined) {
      throw conflict('このメールアドレスは既に登録されています');
    }
    const userId = insertUser({
      email: input.email,
      passwordHash: await hashPassword(input.password),
      name: input.name,
      location: input.location,
      genre: input.genre,
    });
    return c.json(authResponse(userId), 201);
  })
  .post('/login', async (c) => {
    const input = await parseJsonBody(c, loginSchema);
    const credentials = findCredentialsByEmail(input.email);
    const isValid =
      credentials === undefined
        ? await burnPasswordCheck(input.password)
        : await verifyPassword(input.password, credentials.password_hash);
    if (credentials === undefined || !isValid) {
      throw unauthorized('メールアドレスまたはパスワードが正しくありません');
    }
    return c.json(authResponse(credentials.id));
  })
  .post('/logout', requireAuth, (c) => {
    const token = readBearerToken(c.req.header('Authorization'));
    if (token !== null) deleteSession(token);
    return c.body(null, 204);
  });
