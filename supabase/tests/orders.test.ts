import assert from 'node:assert/strict';
import { before, describe, test } from 'node:test';

import type { Transaction } from '@electric-sql/pglite';

import { expectError, setupDatabase, type Harness } from './harness.ts';

let h: Harness;
let seller: string;
let buyer: string;
let stranger: string;

const createListing = (userId: string, title: string, price: number) =>
  h.as(userId, (tx) =>
    tx
      .query<{ id: string }>(
        `select public.create_listing($1, '説明', $2, 'wood', null, null, null, array['delivery'], $3) as id`,
        [title, price, [`${userId}/${title}.jpg`]],
      )
      .then((result) => result.rows[0]?.id ?? ''),
  );

const purchase = (userId: string | null, listingIds: string[]) =>
  h.as(userId, (tx) =>
    tx
      .query<{ id: string }>('select public.purchase_listings($1) as id', [listingIds])
      .then((result) => result.rows[0]?.id ?? ''),
  );

const addToCart = (userId: string, listingId: string) =>
  h.as(userId, (tx) => tx.query('insert into public.cart_items (listing_id) values ($1)', [listingId]));

const statusOf = async (listingId: string) =>
  (await h.db.query<{ status: string }>('select status from public.listings where id = $1', [listingId])).rows[0]?.status;

const count = async (tx: Transaction, sql: string, params: unknown[] = []) =>
  Number((await tx.query<{ n: number }>(`select count(*)::int as n from (${sql}) t`, params)).rows[0]?.n);

before(async () => {
  h = await setupDatabase();
  seller = await h.createUser('seller@example.com', { display_name: '出品者' });
  buyer = await h.createUser('buyer@example.com', { display_name: '購入者' });
  stranger = await h.createUser('stranger@example.com');
});

describe('purchase_listings', () => {
  test('カートの商品をまとめて購入すると、注文が作られ、売り切れになり、カートから消える', async () => {
    const cedar = await createListing(seller, '杉の端材', 1200);
    const walnut = await createListing(seller, 'ウォールナット', 2800);
    await addToCart(buyer, cedar);
    await addToCart(buyer, walnut);

    const orderId = await purchase(buyer, [cedar, walnut]);

    const order = (
      await h.db.query<{ buyer_id: string; total_price: number }>(
        'select buyer_id, total_price from public.orders where id = $1',
        [orderId],
      )
    ).rows[0];
    assert.equal(order?.buyer_id, buyer);
    assert.equal(order?.total_price, 4000);

    const items = (
      await h.db.query<{ title: string; price: number; seller_id: string; image_path: string }>(
        'select title, price, seller_id, image_path from public.order_items where order_id = $1 order by price',
        [orderId],
      )
    ).rows;
    assert.deepEqual(
      items.map((item) => [item.title, item.price, item.seller_id]),
      [
        ['杉の端材', 1200, seller],
        ['ウォールナット', 2800, seller],
      ],
    );
    assert.equal(items[0]?.image_path, `${seller}/杉の端材.jpg`);

    assert.equal(await statusOf(cedar), 'sold');
    assert.equal(await statusOf(walnut), 'sold');
    assert.equal(await h.as(buyer, (tx) => count(tx, 'select * from public.cart_items')), 0);
  });

  test('売り切れの商品は購入できず、一部だけ購入されることもない', async () => {
    const first = await createListing(seller, '先に売れる端材', 500);
    const other = await createListing(seller, '残る端材', 700);
    await purchase(stranger, [first]);

    assert.match(await expectError(purchase(buyer, [first, other])), /売り切れ、または購入できない商品/);
    assert.equal(await statusOf(other), 'active');
  });

  test('自分の出品・非公開の出品は購入できない', async () => {
    const own = await createListing(buyer, '自分の端材', 300);
    assert.match(await expectError(purchase(buyer, [own])), /購入できない商品/);

    const hidden = await createListing(seller, '非公開の端材', 300);
    await h.as(seller, (tx) => tx.query(`update public.listings set status = 'hidden' where id = $1`, [hidden]));
    assert.match(await expectError(purchase(buyer, [hidden])), /購入できない商品/);
  });

  test('未ログインでは購入できず、空の指定はエラーになる', async () => {
    const listing = await createListing(seller, '端材', 300);
    await expectError(purchase(null, [listing]));
    assert.equal(await statusOf(listing), 'active');
    assert.match(await expectError(purchase(buyer, [])), /購入する商品を選んでください/);
  });

  test('購入後に出品が編集・削除されても、購入履歴の内容は変わらない', async () => {
    const listing = await createListing(seller, '元の商品名', 900);
    const orderId = await purchase(buyer, [listing]);
    await h.as(seller, (tx) => tx.query(`update public.listings set title = '変更後', price = 1 where id = $1`, [listing]));
    await h.as(seller, (tx) => tx.query('delete from public.listings where id = $1', [listing]));

    const item = (
      await h.as(buyer, (tx) =>
        tx.query<{ title: string; price: number; listing_id: string | null }>(
          'select title, price, listing_id from public.order_items where order_id = $1',
          [orderId],
        ),
      )
    ).rows[0];
    assert.deepEqual(item, { title: '元の商品名', price: 900, listing_id: null });
  });
});

describe('orders / order_items の RLS', () => {
  let orderId: string;
  before(async () => {
    orderId = await purchase(buyer, [await createListing(seller, 'RLS 確認用', 400)]);
  });

  test('購入者は自分の注文と明細を読める。他人は読めない', async () => {
    assert.equal(await h.as(buyer, (tx) => count(tx, 'select * from public.orders where id = $1', [orderId])), 1);
    assert.equal(await h.as(buyer, (tx) => count(tx, 'select * from public.order_items where order_id = $1', [orderId])), 1);
    assert.equal(await h.as(stranger, (tx) => count(tx, 'select * from public.orders where id = $1', [orderId])), 0);
    assert.equal(await h.as(stranger, (tx) => count(tx, 'select * from public.order_items where order_id = $1', [orderId])), 0);
    // 未ログインには SELECT 権限自体を与えていない
    assert.match(await expectError(h.as(null, (tx) => count(tx, 'select * from public.order_items'))), /permission denied/);
  });

  test('出品者は売れた明細を読めるが、購入者の注文そのものは読めない', async () => {
    assert.equal(await h.as(seller, (tx) => count(tx, 'select * from public.order_items where order_id = $1', [orderId])), 1);
    assert.equal(await h.as(seller, (tx) => count(tx, 'select * from public.orders where id = $1', [orderId])), 0);
  });

  test('注文を直接作成・変更することはできない', async () => {
    await expectError(h.as(buyer, (tx) => tx.query('insert into public.orders (buyer_id, total_price) values ($1, 1)', [buyer])));
    await expectError(h.as(buyer, (tx) => tx.query('update public.orders set total_price = 1 where id = $1', [orderId])));
    await expectError(h.as(buyer, (tx) => tx.query('delete from public.order_items where order_id = $1', [orderId])));
  });
});
