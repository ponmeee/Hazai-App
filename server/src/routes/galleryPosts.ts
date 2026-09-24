import { Hono } from 'hono';
import { z } from 'zod';

import { CATEGORY_SLUGS } from '../domain.ts';
import { badRequest, type AppEnv } from '../http.ts';
import { listGalleryPosts } from '../repositories/galleryPosts.ts';

const listQuerySchema = z.object({
  category: z.enum(CATEGORY_SLUGS).optional(),
  authorId: z.string().optional(),
});

export const galleryPostRoutes = new Hono<AppEnv>().get('/', (c) => {
  const result = listQuerySchema.safeParse(c.req.query());
  if (!result.success) throw badRequest('検索条件が正しくありません');
  return c.json(listGalleryPosts({ categorySlug: result.data.category, authorId: result.data.authorId }));
});
