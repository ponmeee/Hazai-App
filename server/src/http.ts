import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { z } from 'zod';

export type AppEnv = {
  Variables: {
    userId: string;
  };
};

export const badRequest = (message: string): HTTPException => new HTTPException(400, { message });
export const unauthorized = (message = 'ログインが必要です'): HTTPException =>
  new HTTPException(401, { message });
export const forbidden = (message = 'この操作は許可されていません'): HTTPException =>
  new HTTPException(403, { message });
export const notFound = (message = '見つかりませんでした'): HTTPException =>
  new HTTPException(404, { message });
export const conflict = (message: string): HTTPException => new HTTPException(409, { message });

/** 入力はここで検証し、最初の問題をユーザーに見せられる文言で返す */
export async function parseJsonBody<S extends z.ZodType>(c: Context, schema: S): Promise<z.infer<S>> {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    throw badRequest('リクエストの形式が正しくありません');
  }
  const result = schema.safeParse(body);
  if (!result.success) {
    throw badRequest(result.error.issues[0]?.message ?? '入力内容が正しくありません');
  }
  return result.data;
}
