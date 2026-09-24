import { hashPassword } from '../auth/password.ts';
import { insertMessage, findOrCreateConversation } from '../repositories/conversations.ts';
import { insertProduct } from '../repositories/products.ts';
import { db, execute, queryOne, transaction } from './database.ts';
import {
  DEMO_PASSWORD,
  seedConversations,
  seedFollows,
  seedGalleryPosts,
  seedProducts,
  seedUsers,
} from './seedData.ts';

const SEED_CREATED_AT = '2026-09-01T00:00:00.000Z';

export const isDatabaseEmpty = (): boolean => queryOne('SELECT 1 FROM users LIMIT 1') === undefined;

export function clearDatabase(): void {
  transaction(() => {
    for (const table of [
      'messages',
      'conversation_participants',
      'conversations',
      'product_favorites',
      'gallery_posts',
      'products',
      'follows',
      'sessions',
      'users',
    ]) {
      db.exec(`DELETE FROM ${table}`);
    }
  });
}

export async function seedDatabase(): Promise<void> {
  const passwordHashes = await Promise.all(seedUsers.map(() => hashPassword(DEMO_PASSWORD)));

  transaction(() => {
    seedUsers.forEach((user, index) => {
      execute(
        `INSERT INTO users (id, email, password_hash, name, avatar_url, location, genre, bio, created_at)
         VALUES (:id, :email, :passwordHash, :name, :avatarUrl, :location, :genre, :bio, :createdAt)`,
        { ...user, passwordHash: passwordHashes[index] ?? '', createdAt: SEED_CREATED_AT },
      );
    });

    for (const [followerId, followeeId] of seedFollows) {
      execute(
        `INSERT INTO follows (follower_id, followee_id, created_at) VALUES (:followerId, :followeeId, :createdAt)`,
        { followerId, followeeId, createdAt: SEED_CREATED_AT },
      );
    }

    for (const { id, sellerId, favoriteCount, createdAt, ...product } of seedProducts) {
      insertProduct(sellerId, product, id);
      execute('UPDATE products SET favorite_count = :favoriteCount, created_at = :createdAt WHERE id = :id', {
        id,
        favoriteCount,
        createdAt,
      });
    }

    for (const post of seedGalleryPosts) {
      execute(
        `INSERT INTO gallery_posts (id, author_id, title, body, image_url, image_urls, category_slug, like_count, comment_count, created_at)
         VALUES (:id, :authorId, :title, :body, :imageUrl, :imageUrls, :categorySlug, :likeCount, :commentCount, :createdAt)`,
        { ...post, imageUrl: post.imageUrls[0] ?? '', imageUrls: JSON.stringify(post.imageUrls) },
      );
    }
  });

  for (const conversation of seedConversations) {
    const [firstId, secondId] = conversation.participantIds;
    const conversationId = findOrCreateConversation(firstId, secondId, conversation.productId);
    for (const message of conversation.messages) {
      insertMessage(conversationId, message.senderId, message.body, message.createdAt);
    }
  }
}
