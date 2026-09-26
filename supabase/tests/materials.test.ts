import assert from 'node:assert/strict';
import { before, describe, test } from 'node:test';

import { expectError, setupDatabase, type Harness } from './harness.ts';

let h: Harness;
let seller: string;
let maker: string;
let stranger: string;

const createListing = (userId: string, title: string, tags: string[]) =>
  h.as(userId, (tx) =>
    tx
      .query<{ id: string }>(
        `select public.create_listing($1, '説明', 1000, 'wood', null, null, null, array['delivery'], $2, $3) as id`,
        [title, [`${userId}/${title}.jpg`], tags],
      )
      .then((result) => result.rows[0]?.id ?? ''),
  );

type MaterialInput = { listing_id?: string; name?: string; image_path?: string; tags?: string[] };

const createPost = (userId: string, materials: MaterialInput[], title = '端材のスツール') =>
  h.as(userId, (tx) =>
    tx
      .query<{ id: string }>(`select public.create_gallery_post($1, '説明', 'wood', $2, $3::jsonb) as id`, [
        title,
        [`${userId}/post.jpg`],
        JSON.stringify(materials),
      ])
      .then((result) => result.rows[0]?.id ?? ''),
  );

type MaterialRow = { listing_id: string | null; name: string; image_bucket: string | null; image_path: string | null; tags: string[] };

const materialsOf = async (postId: string) =>
  (
    await h.db.query<MaterialRow>(
      'select listing_id, name, image_bucket, image_path, tags from public.gallery_post_materials where gallery_post_id = $1 order by sort_order',
      [postId],
    )
  ).rows;

const related = (userId: string | null, listingId: string) =>
  h.as(userId, (tx) =>
    tx
      .query<{ gallery_post_id: string; score: number }>('select * from public.get_related_gallery_posts($1)', [listingId])
      .then((result) => result.rows),
  );

before(async () => {
  h = await setupDatabase();
  seller = await h.createUser('seller@example.com', { display_name: '出品者' });
  maker = await h.createUser('maker@example.com', { display_name: '作り手' });
  stranger = await h.createUser('stranger@example.com');
});

describe('listings.tags', () => {
  test('ハッシュタグ付きで出品でき、タグの重なりで検索できる', async () => {
    const id = await createListing(seller, '栗の端材', ['栗', '広葉樹']);
    const tags = (await h.db.query<{ tags: string[] }>('select tags from public.listings where id = $1', [id])).rows[0]?.tags;
    assert.deepEqual(tags, ['栗', '広葉樹']);

    const found = await h.as(null, (tx) =>
      tx.query<{ id: string }>(`select id from public.listings where tags && array['広葉樹']::text[]`),
    );
    assert.ok(found.rows.some((row) => row.id === id));
  });

  test('形式に合わないハッシュタグは保存できない', async () => {
    for (const tags of [['#栗'], ['Walnut'], ['栗 材'], ['栗', '栗'], ['a'.repeat(21)], Array.from({ length: 11 }, (_, i) => `t${i}`)]) {
      assert.match(await expectError(createListing(seller, '不正なタグ', tags)), /check constraint/, JSON.stringify(tags));
    }
  });

  test('ハッシュタグを指定しない従来の呼び出しも動く', async () => {
    const id = await h.as(seller, (tx) =>
      tx
        .query<{ id: string }>(
          `select public.create_listing('タグなし', '説明', 500, 'wood', null, null, null, array['delivery'], array[]::text[]) as id`,
        )
        .then((result) => result.rows[0]?.id ?? ''),
    );
    const tags = (await h.db.query<{ tags: string[] }>('select tags from public.listings where id = $1', [id])).rows[0]?.tags;
    assert.deepEqual(tags, []);
  });
});

describe('gallery_post_materials', () => {
  test('出品から選んだ端材は、出品の画像とハッシュタグを写す（クライアントの指定は使わない）', async () => {
    const listingId = await createListing(seller, '栗の端材セット', ['栗', '広葉樹']);
    const postId = await createPost(maker, [
      { listing_id: listingId, image_path: `${stranger}/fake.jpg`, tags: ['偽物'] },
      { name: '手持ちのクルミ', image_path: `${maker}/walnut.jpg`, tags: ['クルミ'] },
    ]);

    assert.deepEqual(await materialsOf(postId), [
      {
        listing_id: listingId,
        name: '栗の端材セット',
        image_bucket: 'listing-images',
        image_path: `${seller}/栗の端材セット.jpg`,
        tags: ['栗', '広葉樹'],
      },
      { listing_id: null, name: '手持ちのクルミ', image_bucket: 'gallery-images', image_path: `${maker}/walnut.jpg`, tags: ['クルミ'] },
    ]);
  });

  test('手入力の端材に他人の画像は使えない', async () => {
    assert.match(
      await expectError(createPost(maker, [{ name: '他人の画像', image_path: `${stranger}/x.jpg` }])),
      /row-level security/,
    );
  });

  test('名前のない手入力の端材・11個以上・見えない出品は登録できず、作品も作られない', async () => {
    const before = Number((await h.db.query<{ n: number }>('select count(*)::int as n from public.gallery_posts')).rows[0]?.n);

    await expectError(createPost(maker, [{ name: '  ' }]));
    assert.match(
      await expectError(createPost(maker, Array.from({ length: 11 }, (_, i) => ({ name: `端材${i}` })))),
      /10個まで/,
    );
    const hidden = await createListing(seller, '非公開', ['栗']);
    await h.as(seller, (tx) => tx.query(`update public.listings set status = 'hidden' where id = $1`, [hidden]));
    assert.match(await expectError(createPost(maker, [{ listing_id: hidden }])), /出品が見つかりません/);

    const after = Number((await h.db.query<{ n: number }>('select count(*)::int as n from public.gallery_posts')).rows[0]?.n);
    assert.equal(after, before);
  });

  test('誰でも読めるが、他人の作品に端材を追加・削除できない', async () => {
    const postId = await createPost(maker, [{ name: '端材' }]);
    const visible = await h.as(null, (tx) =>
      tx.query('select * from public.gallery_post_materials where gallery_post_id = $1', [postId]),
    );
    assert.equal(visible.rows.length, 1);

    assert.match(
      await expectError(
        h.as(stranger, (tx) =>
          tx.query(`insert into public.gallery_post_materials (gallery_post_id, name, sort_order) values ($1, '横入り', 5)`, [postId]),
        ),
      ),
      /row-level security/,
    );
    const deleted = await h.as(stranger, (tx) => tx.query('delete from public.gallery_post_materials where gallery_post_id = $1', [postId]));
    assert.equal(deleted.affectedRows, 0);
  });
});

describe('get_related_gallery_posts', () => {
  test('その出品を使った作品を先頭に、共通するハッシュタグが多い順に返す', async () => {
    const listingId = await createListing(seller, '関連確認用の端材', ['ヒノキ', '針葉樹', '国産']);
    const direct = await createPost(maker, [{ listing_id: listingId }], '直接使った作品');
    const twoTags = await createPost(maker, [{ name: '別のヒノキ', tags: ['ヒノキ', '国産'] }], '2つ共通');
    const oneTag = await createPost(maker, [{ name: '杉', tags: ['針葉樹'] }], '1つ共通');
    const unrelated = await createPost(maker, [{ name: 'ガラス', tags: ['ガラス'] }], '無関係');

    const rows = await related(null, listingId);
    assert.deepEqual(
      rows.map((row) => row.gallery_post_id),
      [direct, twoTags, oneTag],
    );
    assert.ok(!rows.some((row) => row.gallery_post_id === unrelated));
  });
});
