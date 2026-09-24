import { Hono } from 'hono';
import { z } from 'zod';

import { requireAuth } from '../auth/middleware.ts';
import {
  CATEGORY_SLUGS,
  PRODUCT_CONDITIONS,
  PRODUCT_LIMITS,
  SHIPPING_METHODS,
} from '../domain.ts';
import { badRequest, notFound, parseJsonBody, type AppEnv } from '../http.ts';
import { findProductById, insertProduct, listProducts } from '../repositories/products.ts';
import { UPLOADED_IMAGE_PATH_PATTERN } from './uploads.ts';

const listQuerySchema = z.object({
  category: z.enum(CATEGORY_SLUGS).optional(),
  q: z.string().max(100).optional(),
  sellerId: z.string().optional(),
  sort: z.enum(['newest', 'popular']).default('newest'),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

const optionalText = z
  .string()
  .trim()
  .max(50)
  .nullish()
  .transform((value) => (value === undefined || value === null || value === '' ? null : value));

const createSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, '商品名を入力してください')
    .max(PRODUCT_LIMITS.nameMaxLength, `商品名は${PRODUCT_LIMITS.nameMaxLength}文字以内で入力してください`),
  categorySlug: z.enum(CATEGORY_SLUGS, '素材カテゴリを選択してください'),
  size: optionalText,
  weight: optionalText,
  condition: z.enum(PRODUCT_CONDITIONS).nullable().default(null),
  description: z
    .string()
    .trim()
    .min(1, '商品説明を入力してください')
    .max(
      PRODUCT_LIMITS.descriptionMaxLength,
      `商品説明は${PRODUCT_LIMITS.descriptionMaxLength}文字以内で入力してください`,
    ),
  price: z
    .number('値段は数字で入力してください')
    .int('値段は整数で入力してください')
    .min(PRODUCT_LIMITS.priceMin, '値段が低すぎます')
    .max(PRODUCT_LIMITS.priceMax, '値段が高すぎます'),
  shippingMethods: z
    .array(z.enum(SHIPPING_METHODS))
    .min(1, '配送方法を1つ以上選択してください')
    .transform((methods) => [...new Set(methods)]),
  // 任意の外部 URL を商品画像として登録させないため、このサーバーにアップロード済みの画像に限る
  imageUrls: z
    .array(z.string().regex(UPLOADED_IMAGE_PATH_PATTERN, '画像の指定が正しくありません'))
    .max(PRODUCT_LIMITS.maxImages, `画像は${PRODUCT_LIMITS.maxImages}枚までです`),
});

export const productRoutes = new Hono<AppEnv>()
  .get('/', (c) => {
    const result = listQuerySchema.safeParse(c.req.query());
    if (!result.success) throw badRequest('検索条件が正しくありません');
    const { category, q, sellerId, sort, limit } = result.data;
    return c.json(listProducts({ categorySlug: category, keyword: q, sellerId, sort, limit }));
  })
  .get('/:id', (c) => {
    const product = findProductById(c.req.param('id'));
    if (product === undefined) throw notFound('商品が見つかりません');
    return c.json(product);
  })
  .post('/', requireAuth, async (c) => {
    const input = await parseJsonBody(c, createSchema);
    const id = insertProduct(c.get('userId'), input);
    return c.json(findProductById(id), 201);
  });
