import assert from 'node:assert/strict';
import { before, describe, test } from 'node:test';

import type { Transaction } from '@electric-sql/pglite';

import { expectError, setupDatabase, type Harness } from './harness.ts';

let h: Harness;
let seller: string;
let buyer: string;
let stranger: string;

const createListing = (tx: Transaction, title = '杉の端材セット', images: string[] = []) =>
  tx
    .query<{ id: string }>(
      `select public.create_listing($1, '説明です', 1200, 'wood', '30cm', null, 'good', array['delivery'], $2) as id`,
      [title, images],
    )
    .then((result) => result.rows[0]?.id ?? '');

const count = async (tx: Transaction, sql: string, params: unknown[] = []) =>
  Number((await tx.query<{ n: number }>(`select count(*)::int as n from (${sql}) t`, params)).rows[0]?.n);

before(async () => {
  h = await setupDatabase();
  seller = await h.createUser('seller@example.com', {
    display_name: '出品者',
    location: '長野県',
    genre: '木工',
    bio: '端材で家具をつくっています',
  });
  buyer = await h.createUser('buyer@example.com', { display_name: '購入者' });
  stranger = await h.createUser('stranger@example.com');
});

describe('profiles', () => {
  test('サインアップ時にプロフィールが作成される', async () => {
    const profile = (await h.db.query<{ username: string; display_name: string; location: string; bio: string }>(
      'select username, display_name, location, bio from public.profiles where id = $1',
      [seller],
    )).rows[0];
    assert.equal(profile?.display_name, '出品者');
    assert.equal(profile?.location, '長野県');
    assert.equal(profile?.bio, '端材で家具をつくっています');
    assert.match(profile?.username ?? '', /^seller_[0-9a-f]{8}$/);
    // 表示名が未指定ならメールアドレスから作る
    const fallback = (await h.db.query<{ display_name: string }>(
      'select display_name from public.profiles where id = $1',
      [stranger],
    )).rows[0];
    assert.equal(fallback?.display_name, 'stranger');
  });

  test('未ログインでもプロフィールを閲覧できる', async () => {
    assert.equal(await h.as(null, (tx) => count(tx, 'select * from public.profiles')), 3);
  });

  test('自分のプロフィールだけ更新できる', async () => {
    await h.as(buyer, (tx) => tx.query(`update public.profiles set bio = '木工が好きです' where id = $1`, [buyer]));
    const updatedOther = await h.as(buyer, (tx) =>
      tx.query(`update public.profiles set bio = '乗っ取り' where id = $1`, [seller]),
    );
    assert.equal(updatedOther.affectedRows, 0);
    const bio = (await h.db.query<{ bio: string }>('select bio from public.profiles where id = $1', [seller])).rows[0];
    assert.equal(bio?.bio, '端材で家具をつくっています');
  });

  test('アバターに他人のフォルダの画像は指定できない', async () => {
    const message = await expectError(
      h.as(buyer, (tx) => tx.query(`update public.profiles set avatar_url = $1 where id = $2`, [`${seller}/a.jpg`, buyer])),
    );
    assert.match(message, /row-level security/);
    const own = await h.as(buyer, (tx) =>
      tx.query(`update public.profiles set avatar_url = $1 where id = $2`, [`${buyer}/a.jpg`, buyer]),
    );
    assert.equal(own.affectedRows, 1);
  });

  test('ID や作成日時は書き換えられない', async () => {
    const message = await expectError(
      h.as(buyer, (tx) => tx.query(`update public.profiles set created_at = now() where id = $1`, [buyer])),
    );
    assert.match(message, /permission denied/);
  });

  test('プロフィールを直接作成・削除できない', async () => {
    assert.match(
      await expectError(h.as(buyer, (tx) => tx.query(`insert into public.profiles (id, username, display_name) values ($1, 'x_abc', 'x')`, [buyer]))),
      /permission denied/,
    );
    assert.match(
      await expectError(h.as(buyer, (tx) => tx.query('delete from public.profiles where id = $1', [buyer]))),
      /permission denied/,
    );
  });
});

describe('listings', () => {
  let listingId: string;

  before(async () => {
    listingId = await h.as(seller, (tx) => createListing(tx, '杉の端材セット', [`${seller}/1.jpg`, `${seller}/2.jpg`]));
  });

  test('商品と画像が 1 回の RPC で登録され、出品者はログインユーザーになる', async () => {
    const listing = (await h.db.query<{ seller_id: string; status: string }>(
      'select seller_id, status from public.listings where id = $1',
      [listingId],
    )).rows[0];
    assert.equal(listing?.seller_id, seller);
    assert.equal(listing?.status, 'active');
    const images = await h.as(null, (tx) =>
      tx.query<{ storage_path: string; sort_order: number }>(
        'select storage_path, sort_order from public.listing_images where listing_id = $1 order by sort_order',
        [listingId],
      ),
    );
    assert.deepEqual(images.rows.map((row) => row.sort_order), [0, 1]);
  });

  test('未ログインでも公開中の商品を閲覧できる', async () => {
    assert.equal(await h.as(null, (tx) => count(tx, 'select * from public.listings where id = $1', [listingId])), 1);
  });

  test('未ログインでは出品できない', async () => {
    assert.match(await expectError(h.as(null, (tx) => createListing(tx))), /permission denied/);
  });

  test('出品者を他人に偽装できない', async () => {
    const message = await expectError(
      h.as(buyer, (tx) =>
        tx.query(
          `insert into public.listings (seller_id, title, description, price, category, shipping_methods)
           values ($1, 'x', 'x', 100, 'wood', array['post'])`,
          [seller],
        ),
      ),
    );
    assert.match(message, /permission denied/);
  });

  test('他人の商品は更新・削除できない', async () => {
    const updated = await h.as(buyer, (tx) =>
      tx.query(`update public.listings set price = 1 where id = $1`, [listingId]),
    );
    assert.equal(updated.affectedRows, 0);
    const deleted = await h.as(buyer, (tx) => tx.query('delete from public.listings where id = $1', [listingId]));
    assert.equal(deleted.affectedRows, 0);
    const price = (await h.db.query<{ price: number }>('select price from public.listings where id = $1', [listingId])).rows[0];
    assert.equal(price?.price, 1200);
  });

  test('出品者は自分の商品を更新できるが、出品者やお気に入り数は書き換えられない', async () => {
    const updated = await h.as(seller, (tx) =>
      tx.query(`update public.listings set price = 1500, title = '杉の端材セット（大）' where id = $1`, [listingId]),
    );
    assert.equal(updated.affectedRows, 1);
    assert.match(
      await expectError(h.as(seller, (tx) => tx.query('update public.listings set favorite_count = 999 where id = $1', [listingId]))),
      /permission denied/,
    );
    assert.match(
      await expectError(h.as(seller, (tx) => tx.query('update public.listings set seller_id = $2 where id = $1', [listingId, buyer]))),
      /permission denied/,
    );
  });

  test('非公開の商品は出品者以外に見えない', async () => {
    const hiddenId = await h.as(seller, async (tx) => {
      const id = await createListing(tx, '非公開の端材');
      await tx.query(`update public.listings set status = 'hidden' where id = $1`, [id]);
      return id;
    });
    assert.equal(await h.as(null, (tx) => count(tx, 'select * from public.listings where id = $1', [hiddenId])), 0);
    assert.equal(await h.as(buyer, (tx) => count(tx, 'select * from public.listings where id = $1', [hiddenId])), 0);
    assert.equal(await h.as(seller, (tx) => count(tx, 'select * from public.listings where id = $1', [hiddenId])), 1);
  });

  test('他人の商品に画像を追加できず、他人のフォルダの画像も使えない', async () => {
    assert.match(
      await expectError(
        h.as(buyer, (tx) =>
          tx.query('insert into public.listing_images (listing_id, storage_path, sort_order) values ($1, $2, 5)', [listingId, `${buyer}/x.jpg`]),
        ),
      ),
      /row-level security/,
    );
    assert.match(
      await expectError(h.as(seller, (tx) => createListing(tx, '他人の画像', [`${buyer}/x.jpg`]))),
      /row-level security/,
    );
  });

  test('画像は 6 枚まで', async () => {
    const paths = Array.from({ length: 7 }, (_, index) => `${seller}/${index}.jpg`);
    assert.match(await expectError(h.as(seller, (tx) => createListing(tx, '多すぎ', paths))), /6枚まで/);
  });

  test('入力値の制約（価格・カテゴリ・配送方法）', async () => {
    const insert = (price: number, category: string, methods: string[]) =>
      h.as(seller, (tx) =>
        tx.query(`select public.create_listing('x', 'x', $1, $2, null, null, null, $3, array[]::text[])`, [price, category, methods]),
      );
    assert.match(await expectError(insert(0, 'wood', ['post'])), /check constraint/);
    assert.match(await expectError(insert(100, 'stone', ['post'])), /check constraint/);
    assert.match(await expectError(insert(100, 'wood', [])), /check constraint/);
    assert.match(await expectError(insert(100, 'wood', ['drone'])), /check constraint/);
  });

  test('出品者は自分の商品を削除でき、画像も一緒に消える', async () => {
    const id = await h.as(seller, (tx) => createListing(tx, '削除する端材', [`${seller}/d.jpg`]));
    const deleted = await h.as(seller, (tx) => tx.query('delete from public.listings where id = $1', [id]));
    assert.equal(deleted.affectedRows, 1);
    assert.equal(await h.as(seller, (tx) => count(tx, 'select * from public.listing_images where listing_id = $1', [id])), 0);
  });
});

describe('favorites / cart_items', () => {
  let listingId: string;

  before(async () => {
    listingId = await h.as(seller, (tx) => createListing(tx, 'ウォールナット端材'));
  });

  const favoriteCount = async () =>
    (await h.db.query<{ favorite_count: number }>('select favorite_count from public.listings where id = $1', [listingId])).rows[0]
      ?.favorite_count;

  test('お気に入りの追加・削除でお気に入り数が増減する', async () => {
    await h.as(buyer, (tx) => tx.query('insert into public.favorites (listing_id) values ($1)', [listingId]));
    assert.equal(await favoriteCount(), 1);
    assert.match(
      await expectError(h.as(buyer, (tx) => tx.query('insert into public.favorites (listing_id) values ($1)', [listingId]))),
      /duplicate key/,
    );
    await h.as(buyer, (tx) => tx.query('delete from public.favorites where listing_id = $1', [listingId]));
    assert.equal(await favoriteCount(), 0);
  });

  test('他人のお気に入りは見えず、他人として登録もできない', async () => {
    await h.as(buyer, (tx) => tx.query('insert into public.favorites (listing_id) values ($1)', [listingId]));
    assert.equal(await h.as(stranger, (tx) => count(tx, 'select * from public.favorites')), 0);
    assert.equal(await h.as(null, (tx) => count(tx, 'select * from public.favorites').catch(() => -1)), -1);
    assert.match(
      await expectError(h.as(stranger, (tx) => tx.query('insert into public.favorites (user_id, listing_id) values ($1, $2)', [buyer, listingId]))),
      /permission denied/,
    );
    const removed = await h.as(stranger, (tx) => tx.query('delete from public.favorites where listing_id = $1', [listingId]));
    assert.equal(removed.affectedRows, 0);
  });

  test('自分の商品はお気に入り・カートに追加できない', async () => {
    assert.match(
      await expectError(h.as(seller, (tx) => tx.query('insert into public.favorites (listing_id) values ($1)', [listingId]))),
      /row-level security/,
    );
    assert.match(
      await expectError(h.as(seller, (tx) => tx.query('insert into public.cart_items (listing_id) values ($1)', [listingId]))),
      /row-level security/,
    );
  });

  test('カートの追加・数量変更・削除は自分の分だけ', async () => {
    await h.as(buyer, (tx) => tx.query('insert into public.cart_items (listing_id) values ($1)', [listingId]));
    assert.match(
      await expectError(h.as(buyer, (tx) => tx.query('insert into public.cart_items (listing_id) values ($1)', [listingId]))),
      /duplicate key/,
    );
    assert.equal(await h.as(stranger, (tx) => count(tx, 'select * from public.cart_items')), 0);
    const strangerUpdate = await h.as(stranger, (tx) => tx.query('update public.cart_items set quantity = 5'));
    assert.equal(strangerUpdate.affectedRows, 0);
    const buyerUpdate = await h.as(buyer, (tx) => tx.query('update public.cart_items set quantity = 2 where listing_id = $1', [listingId]));
    assert.equal(buyerUpdate.affectedRows, 1);
    assert.match(
      await expectError(h.as(buyer, (tx) => tx.query('update public.cart_items set quantity = 0 where listing_id = $1', [listingId]))),
      /check constraint/,
    );
    const removed = await h.as(buyer, (tx) => tx.query('delete from public.cart_items where listing_id = $1', [listingId]));
    assert.equal(removed.affectedRows, 1);
  });
});

describe('gallery', () => {
  test('作品と画像を投稿でき、他人は更新・削除できない', async () => {
    const postId = await h.as(seller, (tx) =>
      tx
        .query<{ id: string }>(`select public.create_gallery_post('端材のスツール', '説明', 'wood', $1) as id`, [[`${seller}/p.jpg`]])
        .then((result) => result.rows[0]?.id ?? ''),
    );
    assert.equal(await h.as(null, (tx) => count(tx, 'select * from public.gallery_images where gallery_post_id = $1', [postId])), 1);
    const updated = await h.as(buyer, (tx) => tx.query(`update public.gallery_posts set title = 'x' where id = $1`, [postId]));
    assert.equal(updated.affectedRows, 0);
    const deleted = await h.as(buyer, (tx) => tx.query('delete from public.gallery_posts where id = $1', [postId]));
    assert.equal(deleted.affectedRows, 0);
    const own = await h.as(seller, (tx) => tx.query(`update public.gallery_posts set title = '端材のスツール 改' where id = $1`, [postId]));
    assert.equal(own.affectedRows, 1);
  });

  test('写真なしでは投稿できない', async () => {
    assert.match(
      await expectError(h.as(seller, (tx) => tx.query(`select public.create_gallery_post('x', '', 'wood', array[]::text[])`))),
      /1〜4枚/,
    );
  });
});

describe('chat', () => {
  let listingId: string;
  let conversationId: string;

  const startConversation = (userId: string, otherUserId: string, listing: string | null) =>
    h.as(userId, (tx) =>
      tx
        .query<{ id: string }>('select public.start_conversation($1, $2) as id', [otherUserId, listing])
        .then((result) => result.rows[0]?.id ?? ''),
    );

  before(async () => {
    listingId = await h.as(seller, (tx) => createListing(tx, 'ヒノキ角材'));
    conversationId = await startConversation(buyer, seller, listingId);
  });

  test('同じ相手・同じ商品の会話は再利用される', async () => {
    assert.equal(await startConversation(buyer, seller, listingId), conversationId);
    assert.equal(await startConversation(seller, buyer, listingId), conversationId);
  });

  test('出品者が参加しない商品の会話・自分との会話は作れない', async () => {
    assert.match(await expectError(startConversation(buyer, stranger, listingId)), /商品が見つかりません/);
    assert.match(await expectError(startConversation(buyer, buyer, null)), /自分自身/);
    assert.match(await expectError(h.as(null, (tx) => tx.query('select public.start_conversation($1, null)', [seller]))), /permission denied/);
  });

  test('会話や参加者を直接作成できない（他人を会話に追加させない）', async () => {
    assert.match(
      await expectError(h.as(stranger, (tx) => tx.query('insert into public.conversation_members (conversation_id, user_id) values ($1, $2)', [conversationId, stranger]))),
      /permission denied/,
    );
    assert.match(
      await expectError(h.as(stranger, (tx) => tx.query('insert into public.conversations (listing_id) values (null)'))),
      /permission denied/,
    );
  });

  test('参加者はメッセージを送信・閲覧でき、会話の更新日時が進む', async () => {
    await h.as(buyer, (tx) =>
      tx.query('insert into public.messages (conversation_id, content) values ($1, $2)', [conversationId, 'まだありますか？']),
    );
    await h.as(seller, (tx) =>
      tx.query('insert into public.messages (conversation_id, content) values ($1, $2)', [conversationId, 'あります']),
    );
    const messages = await h.as(seller, (tx) =>
      tx.query<{ sender_id: string; content: string }>(
        'select sender_id, content from public.messages where conversation_id = $1 order by created_at',
        [conversationId],
      ),
    );
    assert.deepEqual(messages.rows.map((row) => row.sender_id), [buyer, seller]);

    const rows = await h.as(buyer, (tx) =>
      tx.query<{ id: string; other_user_id: string; listing_title: string; last_message_content: string }>(
        'select * from public.get_my_conversations()',
      ),
    );
    assert.equal(rows.rows.length, 1);
    assert.equal(rows.rows[0]?.other_user_id, seller);
    assert.equal(rows.rows[0]?.listing_title, 'ヒノキ角材');
    assert.equal(rows.rows[0]?.last_message_content, 'あります');
  });

  test('送信者を他人に偽装できない', async () => {
    assert.match(
      await expectError(
        h.as(buyer, (tx) =>
          tx.query('insert into public.messages (conversation_id, sender_id, content) values ($1, $2, $3)', [conversationId, seller, 'なりすまし']),
        ),
      ),
      /permission denied/,
    );
  });

  test('参加していないユーザーは会話・参加者・メッセージを取得も送信もできない', async () => {
    assert.equal(await h.as(stranger, (tx) => count(tx, 'select * from public.conversations')), 0);
    assert.equal(await h.as(stranger, (tx) => count(tx, 'select * from public.conversation_members')), 0);
    assert.equal(await h.as(stranger, (tx) => count(tx, 'select * from public.messages')), 0);
    assert.equal(await h.as(stranger, (tx) => count(tx, 'select * from public.get_my_conversations()')), 0);
    assert.match(
      await expectError(
        h.as(stranger, (tx) =>
          tx.query('insert into public.messages (conversation_id, content) values ($1, $2)', [conversationId, '割り込み']),
        ),
      ),
      /row-level security/,
    );
    assert.match(await expectError(h.as(null, (tx) => count(tx, 'select * from public.messages'))), /permission denied/);
  });

  test('メッセージは編集・削除できない', async () => {
    assert.match(
      await expectError(h.as(buyer, (tx) => tx.query(`update public.messages set content = '改ざん' where conversation_id = $1`, [conversationId]))),
      /permission denied/,
    );
    assert.match(
      await expectError(h.as(buyer, (tx) => tx.query('delete from public.messages where conversation_id = $1', [conversationId]))),
      /permission denied/,
    );
  });
});

describe('storage', () => {
  const upload = (userId: string, bucket: string, name: string) =>
    h.as(userId, (tx) => tx.query('insert into storage.objects (bucket_id, name) values ($1, $2)', [bucket, name]));

  test('バケットが公開設定で作成されている', async () => {
    const buckets = await h.db.query<{ id: string; public: boolean }>('select id, public from storage.buckets order by id');
    assert.deepEqual(buckets.rows, [
      { id: 'avatars', public: true },
      { id: 'gallery-images', public: true },
      { id: 'listing-images', public: true },
    ]);
  });

  test('自分のフォルダにはアップロードでき、他人のフォルダにはできない', async () => {
    await upload(buyer, 'listing-images', `${buyer}/ok.jpg`);
    await upload(buyer, 'avatars', `${buyer}/avatar.jpg`);
    assert.match(await expectError(upload(buyer, 'listing-images', `${seller}/evil.jpg`)), /row-level security/);
    assert.match(await expectError(upload(buyer, 'gallery-images', 'evil.jpg')), /row-level security/);
    assert.match(await expectError(h.as(null, (tx) => tx.query(`insert into storage.objects (bucket_id, name) values ('avatars', 'x/y.jpg')`))), /row-level security/);
  });

  test('他人のファイルは上書き・削除できない', async () => {
    await upload(seller, 'listing-images', `${seller}/mine.jpg`);
    const renamed = await h.as(buyer, (tx) =>
      tx.query(`update storage.objects set name = $1 where name = $2`, [`${buyer}/stolen.jpg`, `${seller}/mine.jpg`]),
    );
    assert.equal(renamed.affectedRows, 0);
    const deleted = await h.as(buyer, (tx) => tx.query('delete from storage.objects where name = $1', [`${seller}/mine.jpg`]));
    assert.equal(deleted.affectedRows, 0);
    const own = await h.as(seller, (tx) => tx.query('delete from storage.objects where name = $1', [`${seller}/mine.jpg`]));
    assert.equal(own.affectedRows, 1);
  });
});

describe('profile_stats / follows', () => {
  test('フォローは本人としてのみ作成でき、件数に反映される', async () => {
    await h.as(buyer, (tx) => tx.query('insert into public.follows (followee_id) values ($1)', [seller]));
    assert.match(
      await expectError(h.as(buyer, (tx) => tx.query('insert into public.follows (follower_id, followee_id) values ($1, $2)', [stranger, seller]))),
      /permission denied/,
    );
    const stats = await h.as(null, (tx) =>
      tx.query<{ follower_count: number; following_count: number }>(
        'select follower_count, following_count from public.profile_stats where id = $1',
        [seller],
      ),
    );
    assert.deepEqual(stats.rows[0], { follower_count: 1, following_count: 0 });
  });
});
