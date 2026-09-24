import { execute, nowIso, queryAll, transaction } from '../db/database.ts';

export const listFavoriteProductIds = (userId: string): string[] =>
  queryAll<{ product_id: string }>(
    'SELECT product_id FROM product_favorites WHERE user_id = :userId ORDER BY created_at DESC',
    { userId },
  ).map((row) => row.product_id);

// favorite_count は一覧の並び替え（人気順）に使うため、登録・解除と同じトランザクションで増減させる。
// 既に登録済み・未登録の場合は件数を変えず、同じリクエストを繰り返しても結果が変わらないようにしている。
export function addFavorite(userId: string, productId: string): void {
  transaction(() => {
    const inserted = execute(
      `INSERT INTO product_favorites (user_id, product_id, created_at)
       VALUES (:userId, :productId, :createdAt)
       ON CONFLICT (user_id, product_id) DO NOTHING`,
      { userId, productId, createdAt: nowIso() },
    );
    if (inserted > 0) {
      execute('UPDATE products SET favorite_count = favorite_count + 1 WHERE id = :productId', { productId });
    }
  });
}

export function removeFavorite(userId: string, productId: string): void {
  transaction(() => {
    const deleted = execute(
      'DELETE FROM product_favorites WHERE user_id = :userId AND product_id = :productId',
      { userId, productId },
    );
    if (deleted > 0) {
      execute('UPDATE products SET favorite_count = favorite_count - 1 WHERE id = :productId', { productId });
    }
  });
}
