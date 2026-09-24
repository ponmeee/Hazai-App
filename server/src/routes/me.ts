import { Hono } from 'hono';
import { z } from 'zod';

import { requireAuth } from '../auth/middleware.ts';
import { notFound, parseJsonBody, type AppEnv } from '../http.ts';
import { getAccount, listFollowing, updateProfile } from '../repositories/users.ts';

const profileSchema = z.object({
  name: z.string().trim().min(1, '名前を入力してください').max(30, '名前は30文字以内で入力してください'),
  location: z.string().trim().max(30, '地域は30文字以内で入力してください'),
  genre: z.string().trim().max(30, 'ジャンルは30文字以内で入力してください'),
  bio: z.string().trim().max(300, '自己紹介は300文字以内で入力してください'),
});

const requireAccount = (userId: string) => {
  const account = getAccount(userId);
  if (account === undefined) throw notFound('アカウントが見つかりません');
  return account;
};

export const meRoutes = new Hono<AppEnv>()
  .use(requireAuth)
  .get('/', (c) => c.json(requireAccount(c.get('userId'))))
  .patch('/', async (c) => {
    const patch = await parseJsonBody(c, profileSchema);
    updateProfile(c.get('userId'), patch);
    return c.json(requireAccount(c.get('userId')));
  })
  .get('/following', (c) => c.json(listFollowing(c.get('userId'))));
