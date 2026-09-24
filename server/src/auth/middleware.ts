import { createMiddleware } from 'hono/factory';

import { unauthorized, type AppEnv } from '../http.ts';
import { findUserIdBySessionToken, readBearerToken } from './sessions.ts';

export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  const token = readBearerToken(c.req.header('Authorization'));
  const userId = token === null ? null : findUserIdBySessionToken(token);
  if (userId === null) throw unauthorized();
  c.set('userId', userId);
  await next();
});
