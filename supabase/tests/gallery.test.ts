import assert from 'node:assert/strict';
import { before, describe, test } from 'node:test';

import type { Transaction } from '@electric-sql/pglite';

import { expectError, setupDatabase, type Harness } from './harness.ts';

let h: Harness;
let author: string;
let fan: string;
let stranger: string;

const createPost = (userId: string, title = '端材のスツール') =>
  h.as(userId, (tx) =>
    tx
      .query<{ id: string }>(`select public.create_gallery_post($1, '説明', 'wood', $2) as id`, [title, [`${userId}/p.jpg`]])
      .then((result) => result.rows[0]?.id ?? ''),
  );

const counts = async (postId: string) =>
  (
    await h.db.query<{ like_count: number; comment_count: number }>(
      'select like_count, comment_count from public.gallery_posts where id = $1',
      [postId],
    )
  ).rows[0];

const count = async (tx: Transaction, sql: string, params: unknown[] = []) =>
  Number((await tx.query<{ n: number }>(`select count(*)::int as n from (${sql}) t`, params)).rows[0]?.n);

before(async () => {
  h = await setupDatabase();
  author = await h.createUser('author@example.com', { display_name: '投稿者' });
  fan = await h.createUser('fan@example.com', { display_name: 'ファン' });
  stranger = await h.createUser('stranger@example.com');
});

describe('gallery_likes', () => {
  let postId: string;
  before(async () => {
    postId = await createPost(author);
  });

  test('いいねの追加・取り消しで件数が増減し、二重には付かない', async () => {
    await h.as(fan, (tx) => tx.query('insert into public.gallery_likes (gallery_post_id) values ($1)', [postId]));
    assert.equal((await counts(postId))?.like_count, 1);
    assert.match(
      await expectError(h.as(fan, (tx) => tx.query('insert into public.gallery_likes (gallery_post_id) values ($1)', [postId]))),
      /duplicate key/,
    );
    await h.as(fan, (tx) => tx.query('delete from public.gallery_likes where gallery_post_id = $1', [postId]));
    assert.equal((await counts(postId))?.like_count, 0);
  });

  test('他人のいいねは見えず、他人として付けたり外したりできない', async () => {
    await h.as(fan, (tx) => tx.query('insert into public.gallery_likes (gallery_post_id) values ($1)', [postId]));
    assert.equal(await h.as(stranger, (tx) => count(tx, 'select * from public.gallery_likes')), 0);
    assert.match(
      await expectError(
        h.as(stranger, (tx) => tx.query('insert into public.gallery_likes (user_id, gallery_post_id) values ($1, $2)', [fan, postId])),
      ),
      /permission denied/,
    );
    const removed = await h.as(stranger, (tx) => tx.query('delete from public.gallery_likes where gallery_post_id = $1', [postId]));
    assert.equal(removed.affectedRows, 0);
    assert.match(
      await expectError(h.as(null, (tx) => tx.query('insert into public.gallery_likes (gallery_post_id) values ($1)', [postId]))),
      /permission denied/,
    );
  });

  test('投稿者でもいいね数・コメント数は書き換えられない', async () => {
    assert.match(
      await expectError(h.as(author, (tx) => tx.query('update public.gallery_posts set like_count = 999 where id = $1', [postId]))),
      /permission denied/,
    );
    assert.match(
      await expectError(h.as(author, (tx) => tx.query('update public.gallery_posts set comment_count = 999 where id = $1', [postId]))),
      /permission denied/,
    );
  });

  test('プロフィールのいいね数は、自分の作品が受け取ったいいねの合計', async () => {
    const stats = await h.as(null, (tx) =>
      tx.query<{ like_count: number }>('select like_count from public.profile_stats where id = $1', [author]),
    );
    assert.equal(stats.rows[0]?.like_count, (await counts(postId))?.like_count);
  });
});

describe('gallery_comments', () => {
  let postId: string;
  let fanCommentId: string;

  const addComment = (userId: string, content: string) =>
    h.as(userId, (tx) =>
      tx
        .query<{ id: string }>('insert into public.gallery_comments (gallery_post_id, content) values ($1, $2) returning id', [postId, content])
        .then((result) => result.rows[0]?.id ?? ''),
    );

  before(async () => {
    postId = await createPost(author, 'ガラスの一輪挿し');
    fanCommentId = await addComment(fan, 'すてきです！');
  });

  test('コメントすると件数が増え、未ログインでも閲覧できる', async () => {
    assert.equal((await counts(postId))?.comment_count, 1);
    const rows = await h.as(null, (tx) =>
      tx.query<{ author_id: string; content: string }>('select author_id, content from public.gallery_comments where gallery_post_id = $1', [postId]),
    );
    assert.deepEqual(rows.rows, [{ author_id: fan, content: 'すてきです！' }]);
  });

  test('投稿者を偽装できず、空のコメントや未ログインでは投稿できない', async () => {
    assert.match(
      await expectError(
        h.as(stranger, (tx) =>
          tx.query('insert into public.gallery_comments (gallery_post_id, author_id, content) values ($1, $2, $3)', [postId, fan, 'なりすまし']),
        ),
      ),
      /permission denied/,
    );
    assert.match(await expectError(addComment(fan, '   ')), /check constraint/);
    assert.match(
      await expectError(h.as(null, (tx) => tx.query('insert into public.gallery_comments (gallery_post_id, content) values ($1, $2)', [postId, 'x']))),
      /permission denied/,
    );
  });

  test('コメントは編集できない', async () => {
    assert.match(
      await expectError(h.as(fan, (tx) => tx.query(`update public.gallery_comments set content = '改ざん' where id = $1`, [fanCommentId]))),
      /permission denied/,
    );
  });

  test('第三者は他人のコメントを消せない', async () => {
    const removed = await h.as(stranger, (tx) => tx.query('delete from public.gallery_comments where id = $1', [fanCommentId]));
    assert.equal(removed.affectedRows, 0);
  });

  test('コメントした本人と、作品の投稿者はコメントを消せる', async () => {
    const own = await h.as(fan, (tx) => tx.query('delete from public.gallery_comments where id = $1', [fanCommentId]));
    assert.equal(own.affectedRows, 1);
    const strangerComment = await addComment(stranger, '宣伝です');
    const moderated = await h.as(author, (tx) => tx.query('delete from public.gallery_comments where id = $1', [strangerComment]));
    assert.equal(moderated.affectedRows, 1);
    assert.equal((await counts(postId))?.comment_count, 0);
  });
});

describe('作品の削除', () => {
  test('投稿者だけが削除でき、画像・いいね・コメントも一緒に消える', async () => {
    const postId = await createPost(author, '削除する作品');
    await h.as(fan, (tx) => tx.query('insert into public.gallery_likes (gallery_post_id) values ($1)', [postId]));
    await h.as(fan, (tx) => tx.query('insert into public.gallery_comments (gallery_post_id, content) values ($1, $2)', [postId, 'いいですね']));

    const byOther = await h.as(fan, (tx) => tx.query('delete from public.gallery_posts where id = $1', [postId]));
    assert.equal(byOther.affectedRows, 0);

    const byAuthor = await h.as(author, (tx) => tx.query('delete from public.gallery_posts where id = $1', [postId]));
    assert.equal(byAuthor.affectedRows, 1);
    for (const table of ['gallery_images', 'gallery_likes', 'gallery_comments']) {
      const remaining = await h.db.query<{ n: number }>(`select count(*)::int as n from public.${table} where gallery_post_id = $1`, [postId]);
      assert.equal(remaining.rows[0]?.n, 0, `${table} が残っています`);
    }
  });
});
