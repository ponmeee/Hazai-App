import type { SQLInputValue } from 'node:sqlite';

import { queryAll } from '../db/database.ts';
import type { CategorySlug } from '../domain.ts';
import type { GalleryPostDto } from '../dto.ts';
import { toUserSummary, userSummaryColumns, type UserSummaryRow } from './userColumns.ts';

type GalleryPostRow = UserSummaryRow & {
  id: string;
  title: string;
  body: string;
  image_url: string;
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
  categorySlug: row.category_slug,
  likeCount: row.like_count,
  commentCount: row.comment_count,
  createdAt: row.created_at,
  author: toUserSummary(row),
});

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
  return queryAll<GalleryPostRow>(
    `SELECT g.*, ${userSummaryColumns('u')}
     FROM gallery_posts g JOIN users u ON u.id = g.author_id
     ${where}
     ORDER BY g.created_at DESC`,
    params,
  ).map(toGalleryPost);
}
