import { Hono } from 'hono';
import { z } from 'zod';

import { requireAuth } from '../auth/middleware.ts';
import { CATEGORY_SLUGS, GALLERY_POST_LIMITS } from '../domain.ts';
import { badRequest, parseJsonBody, type AppEnv } from '../http.ts';
import { findGalleryPostById, insertGalleryPost, listGalleryPosts } from '../repositories/galleryPosts.ts';
import { UPLOADED_IMAGE_PATH_PATTERN } from './uploads.ts';

const listQuerySchema = z.object({
  category: z.enum(CATEGORY_SLUGS).optional(),
  authorId: z.string().optional(),
});

const { titleMaxLength, bodyMaxLength, maxImages } = GALLERY_POST_LIMITS;

const createSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'タイトルを入力してください')
    .max(titleMaxLength, `タイトルは${titleMaxLength}文字以内で入力してください`),
  body: z.string().trim().max(bodyMaxLength, `作品説明は${bodyMaxLength}文字以内で入力してください`),
  categorySlug: z.enum(CATEGORY_SLUGS, '素材カテゴリを選択してください'),
  // 任意の外部 URL を作品画像として登録させないため、このサーバーにアップロード済みの画像に限る
  imageUrls: z
    .array(z.string().regex(UPLOADED_IMAGE_PATH_PATTERN, '画像の指定が正しくありません'))
    .min(1, '写真を1枚以上追加してください')
    .max(maxImages, `写真は${maxImages}枚までです`),
});

export const galleryPostRoutes = new Hono<AppEnv>()
  .get('/', (c) => {
    const result = listQuerySchema.safeParse(c.req.query());
    if (!result.success) throw badRequest('検索条件が正しくありません');
    return c.json(listGalleryPosts({ categorySlug: result.data.category, authorId: result.data.authorId }));
  })
  .post('/', requireAuth, async (c) => {
    const input = await parseJsonBody(c, createSchema);
    const id = insertGalleryPost(c.get('userId'), input);
    return c.json(findGalleryPostById(id), 201);
  });
