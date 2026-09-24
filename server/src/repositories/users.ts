import { randomUUID } from 'node:crypto';

import { execute, nowIso, queryAll, queryOne } from '../db/database.ts';
import type { AccountDto, UserProfileDto, UserSummaryDto } from '../dto.ts';
import { toUserSummary, userSummaryColumns, type UserSummaryRow } from './userColumns.ts';

type ProfileRow = UserSummaryRow & {
  email: string;
  bio: string;
  follower_count: number;
  following_count: number;
  like_count: number;
};

const PROFILE_SELECT = `
  SELECT ${userSummaryColumns('u')}, u.email, u.bio,
    (SELECT COUNT(*) FROM follows f WHERE f.followee_id = u.id) AS follower_count,
    (SELECT COUNT(*) FROM follows f WHERE f.follower_id = u.id) AS following_count,
    (SELECT COALESCE(SUM(g.like_count), 0) FROM gallery_posts g WHERE g.author_id = u.id) AS like_count
  FROM users u`;

const toProfile = (row: ProfileRow): UserProfileDto => ({
  ...toUserSummary(row),
  bio: row.bio,
  followerCount: row.follower_count,
  followingCount: row.following_count,
  likeCount: row.like_count,
});

export const findCredentialsByEmail = (email: string) =>
  queryOne<{ id: string; password_hash: string }>(
    'SELECT id, password_hash FROM users WHERE email = :email',
    { email },
  );

export const userExists = (id: string): boolean =>
  queryOne('SELECT 1 FROM users WHERE id = :id', { id }) !== undefined;

export type NewUser = {
  email: string;
  passwordHash: string;
  name: string;
  location: string;
  genre: string;
};

export function insertUser(user: NewUser): string {
  const id = randomUUID();
  execute(
    `INSERT INTO users (id, email, password_hash, name, avatar_url, location, genre, bio, created_at)
     VALUES (:id, :email, :passwordHash, :name, NULL, :location, :genre, '', :createdAt)`,
    { id, ...user, createdAt: nowIso() },
  );
  return id;
}

export type ProfilePatch = {
  name: string;
  location: string;
  genre: string;
  bio: string;
};

export function updateProfile(id: string, patch: ProfilePatch): void {
  execute(
    `UPDATE users SET name = :name, location = :location, genre = :genre, bio = :bio WHERE id = :id`,
    { id, ...patch },
  );
}

export function getUserProfile(id: string): UserProfileDto | undefined {
  const row = queryOne<ProfileRow>(`${PROFILE_SELECT} WHERE u.id = :id`, { id });
  return row === undefined ? undefined : toProfile(row);
}

export function getAccount(id: string): AccountDto | undefined {
  const row = queryOne<ProfileRow>(`${PROFILE_SELECT} WHERE u.id = :id`, { id });
  return row === undefined ? undefined : { ...toProfile(row), email: row.email };
}

export const listFollowing = (userId: string): UserSummaryDto[] =>
  queryAll<UserSummaryRow>(
    `SELECT ${userSummaryColumns('u')}
     FROM follows f JOIN users u ON u.id = f.followee_id
     WHERE f.follower_id = :userId
     ORDER BY f.created_at`,
    { userId },
  ).map(toUserSummary);
