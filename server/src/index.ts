import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';
import { WebSocketServer } from 'ws';

import { config } from './config.ts';
import { isDatabaseEmpty, seedDatabase } from './db/seed.ts';
import type { AppEnv } from './http.ts';
import { realtimeHandler } from './realtime/hub.ts';
import { authRoutes } from './routes/auth.ts';
import { conversationRoutes } from './routes/conversations.ts';
import { devRoutes } from './routes/dev.ts';
import { galleryPostRoutes } from './routes/galleryPosts.ts';
import { meRoutes } from './routes/me.ts';
import { productRoutes } from './routes/products.ts';
import { uploadRoutes } from './routes/uploads.ts';
import { userRoutes } from './routes/users.ts';

// 開発時は同じ PC（localhost）と LAN（プライベート IP）から開いた Web アプリを許可する。
// 認証は Cookie ではなく Bearer トークンのため、オリジンを広げても他サイトからログイン状態を悪用されることはない。
const DEV_ORIGIN =
  /^http:\/\/(localhost|127\.0\.0\.1|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(:\d+)?$/;

const isAllowedOrigin = (origin: string): boolean =>
  config.extraCorsOrigins.includes(origin) || (!config.isProduction && DEV_ORIGIN.test(origin));

const app = new Hono<AppEnv>();

app.use(
  '*',
  cors({
    origin: (origin) => (isAllowedOrigin(origin) ? origin : null),
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  }),
);

app.get('/health', (c) => c.json({ ok: true }));
app.get('/ws', realtimeHandler);
app.route('/auth', authRoutes);
app.route('/me', meRoutes);
app.route('/users', userRoutes);
app.route('/products', productRoutes);
app.route('/gallery-posts', galleryPostRoutes);
app.route('/conversations', conversationRoutes);
app.route('/uploads', uploadRoutes);
if (!config.isProduction) app.route('/dev', devRoutes);

app.notFound((c) => c.json({ error: { message: '見つかりませんでした' } }, 404));
app.onError((error, c) => {
  if (error instanceof HTTPException) {
    return c.json({ error: { message: error.message } }, error.status);
  }
  console.error(error);
  return c.json({ error: { message: 'サーバーでエラーが発生しました' } }, 500);
});

if (!config.isProduction && isDatabaseEmpty()) {
  await seedDatabase();
  console.log('空のデータベースにデモデータを投入しました');
}

serve({ fetch: app.fetch, port: config.port, websocket: { server: new WebSocketServer({ noServer: true }) } }, (info) => {
  console.log(`はざい箱 server: http://localhost:${info.port}`);
});
