import { Hono } from 'hono';

import { notFound, type AppEnv } from '../http.ts';
import { getUserProfile } from '../repositories/users.ts';

export const userRoutes = new Hono<AppEnv>().get('/:id', (c) => {
  const profile = getUserProfile(c.req.param('id'));
  if (profile === undefined) throw notFound('ユーザーが見つかりません');
  return c.json(profile);
});
