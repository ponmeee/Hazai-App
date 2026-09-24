import type { UserSummaryDto } from '../dto.ts';

/** JOIN 先のユーザーを共通の列名で取り出し、同じ変換関数で DTO にする */
export const userSummaryColumns = (alias: string): string =>
  `${alias}.id AS user_id, ${alias}.name AS user_name, ${alias}.avatar_url AS user_avatar_url,
   ${alias}.location AS user_location, ${alias}.genre AS user_genre`;

export type UserSummaryRow = {
  user_id: string;
  user_name: string;
  user_avatar_url: string | null;
  user_location: string;
  user_genre: string;
};

export const toUserSummary = (row: UserSummaryRow): UserSummaryDto => ({
  id: row.user_id,
  name: row.user_name,
  avatarUrl: row.user_avatar_url,
  location: row.user_location,
  genre: row.user_genre,
});
