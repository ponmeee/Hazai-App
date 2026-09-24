import { Hono } from 'hono';

import { DEMO_PASSWORD, seedUsers } from '../db/seedData.ts';
import type { AppEnv } from '../http.ts';

/** 開発時のみ公開する。ログイン画面からデモアカウントを選べるようにするため */
export const devRoutes = new Hono<AppEnv>().get('/demo-accounts', (c) =>
  c.json({
    password: DEMO_PASSWORD,
    accounts: seedUsers.map(({ email, name, avatarUrl }) => ({ email, name, avatarUrl })),
  }),
);
