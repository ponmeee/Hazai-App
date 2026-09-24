import { randomUUID } from 'node:crypto';
import type { SQLInputValue } from 'node:sqlite';

import { execute, nowIso, queryAll, queryOne } from '../db/database.ts';
import type { CategorySlug } from '../domain.ts';
import type { GalleryPostDto } from '../dto.ts';
import { toUserSummary, userSummaryColumns, type UserSummaryRow } from './userColumns.ts';

type GalleryPostRow = UserSummaryRow & {
  id: string;
  title: string;
  body: string;
  image_url: string;
  image_urls: string;
  category_slug: CategorySlug;
  like_count: number;
  comment_count: number;
  created_at: string;
};

const toGalleryPost = (row: GalleryPostRow): GalleryPostDto => ({
  id: row.id,
  title: row.title,
  body: row.body,
  imageUrl: row.image_url,
  imageUrls: JSON.parse(row.image_urls) as string[],
  categorySlug: row.category_slug,
  likeCount: row.like_count,
  commentCount: row.comment_count,
  createdAt: row.created_at,
  author: toUserSummary(row),
});

const GALLERY_POST_SELECT = `
  SELECT g.*, ${userSummaryColumns('u')}
  FROM gallery_posts g JOIN users u ON u.id = g.author_id`;

export type GalleryPostQuery = {
  categorySlug?: CategorySlug;
  authorId?: string;
};

export function listGalleryPosts(query: GalleryPostQuery): GalleryPostDto[] {
  const conditions: string[] = [];
  const params: Record<string, SQLInputValue> = {};

  if (query.categorySlug !== undefined) {
    conditions.push('g.category_slug = :categorySlug');
    params.categorySlug = query.categorySlug;
  }
  if (query.authorId !== undefined) {
    conditions.push('g.author_id = :authorId');
    params.authorId = query.authorId;
  }

  const where = conditions.length === 0 ? '' : `WHERE ${conditions.join(' AND ')}`;
  return queryAll<GalleryPostRow>(`${GALLERY_POST_SELECT} ${where} ORDER BY g.created_at DESC`, params).map(
    toGalleryPost,
  );
}

export function findGalleryPostById(id: string): GalleryPostDto | undefined {
  const row = queryOne<GalleryPostRow>(`${GALLERY_POST_SELECT} WHERE g.id = :id`, { id });
  return row === undefined ? undefined : toGalleryPost(row);
}

export type NewGalleryPost = {
  title: string;
  body: string;
  categorySlug: CategorySlug;
  /** 1枚以上。先頭が一覧に表示される */
  imageUrls: string[];
};

export function insertGalleryPost(authorId: string, post: NewGalleryPost): string {
  const [coverUrl] = post.imageUrls;
  if (coverUrl === undefined) throw new Error('insertGalleryPost には画像を1枚以上渡す');
  const id = randomUUID();
  execute(
    `INSERT INTO gallery_posts (id, author_id, title, body, image_url, image_urls, category_slug,
       like_count, comment_count, created_at)
     VALUES (:id, :authorId, :title, :body, :imageUrl, :imageUrls, :categorySlug, 0, 0, :createdAt)`,
    {
      id,
      authorId,
      title: post.title,
      body: post.body,
      imageUrl: coverUrl,
      imageUrls: JSON.stringify(post.imageUrls),
      categorySlug: post.categorySlug,
      createdAt: nowIso(),
    },
  );
  return id;
}
