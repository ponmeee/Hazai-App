-- 購入（決済は行わない）。orders が 1 回の購入、order_items がその中の商品。
-- 商品名・価格・画像は購入時点の内容を写して残す。出品者が後から編集・削除しても購入履歴が変わらないようにするため。
-- 書き込みは purchase_listings() のみで行い、テーブルへの直接の INSERT / UPDATE / DELETE は許可しない。

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  total_price integer not null check (total_price >= 1),
  created_at timestamptz not null default now()
);

create index orders_buyer_id_created_at_idx on public.orders (buyer_id, created_at desc);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  -- 出品が削除されても履歴は残す
  listing_id uuid references public.listings (id) on delete set null,
  seller_id uuid references public.profiles (id) on delete set null,
  title text not null check (char_length(btrim(title)) between 1 and 40),
  price integer not null check (price between 1 and 9999999),
  -- listing-images バケット内のパス（購入時点の 1 枚目）
  image_path text check (char_length(image_path) <= 500),
  created_at timestamptz not null default now(),
  -- 同じ出品が二重に売れないようにする最後の砦（NULL は重複可）
  unique (listing_id)
);

create index order_items_order_id_idx on public.order_items (order_id);
create index order_items_seller_id_idx on public.order_items (seller_id);

-- ---------------------------------------------------------------------------
-- purchase_listings: 指定した出品をまとめて購入する
-- 他人の出品を sold に変えるため SECURITY DEFINER。購入者は必ず auth.uid() にする
-- ---------------------------------------------------------------------------
create or replace function public.purchase_listings(p_listing_ids uuid[])
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  buyer uuid := auth.uid();
  listing_ids uuid[];
  purchasable_count integer;
  new_order_id uuid;
begin
  if buyer is null then
    raise exception using errcode = '42501', message = 'ログインが必要です';
  end if;

  select coalesce(array_agg(distinct id), '{}') into listing_ids from unnest(p_listing_ids) as id where id is not null;
  if cardinality(listing_ids) = 0 then
    raise exception using errcode = '22023', message = '購入する商品を選んでください';
  end if;
  if cardinality(listing_ids) > 50 then
    raise exception using errcode = '22023', message = '一度に購入できるのは50点までです';
  end if;

  -- 同時に購入された場合に備えて対象の出品を行ロックし、ロック後の状態で判定する
  perform 1 from public.listings where id = any (listing_ids) for update;

  select count(*) into purchasable_count
  from public.listings
  where id = any (listing_ids) and status = 'active' and seller_id <> buyer;

  if purchasable_count <> cardinality(listing_ids) then
    raise exception using errcode = 'P0001', message = '売り切れ、または購入できない商品が含まれています';
  end if;

  insert into public.orders (buyer_id, total_price)
  select buyer, sum(price) from public.listings where id = any (listing_ids)
  returning id into new_order_id;

  insert into public.order_items (order_id, listing_id, seller_id, title, price, image_path)
  select
    new_order_id,
    l.id,
    l.seller_id,
    l.title,
    l.price,
    (select i.storage_path from public.listing_images i where i.listing_id = l.id order by i.sort_order limit 1)
  from public.listings l
  where l.id = any (listing_ids);

  update public.listings set status = 'sold' where id = any (listing_ids);
  delete from public.cart_items where user_id = buyer and listing_id = any (listing_ids);

  return new_order_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- 権限
-- ---------------------------------------------------------------------------
revoke all on public.orders, public.order_items from anon, authenticated;
grant select on public.orders, public.order_items to authenticated;

revoke execute on function public.purchase_listings(uuid[]) from public, anon, authenticated;
grant execute on function public.purchase_listings(uuid[]) to authenticated;

-- ---------------------------------------------------------------------------
-- RLS: 購入者は自分の購入を、出品者は自分の商品が売れた明細を読める（発送のため）
-- ---------------------------------------------------------------------------
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "orders: buyers can read their own orders"
on public.orders for select
to authenticated
using (buyer_id = (select auth.uid()));

create policy "order_items: buyers and sellers can read"
on public.order_items for select
to authenticated
using (
  seller_id = (select auth.uid())
  or exists (select 1 from public.orders o where o.id = order_id and o.buyer_id = (select auth.uid()))
);
