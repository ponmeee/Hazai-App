-- はざい箱 初期スキーマ
-- テーブル・制約・インデックス・トリガー・関数・権限（GRANT）を定義する。
-- RLS ポリシーは 20260924000002_rls_policies.sql、Storage は 20260924000003_storage.sql を参照。

-- ---------------------------------------------------------------------------
-- 共通: updated_at の自動更新
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles: auth.users と 1 対 1 のアプリ用プロフィール
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_]{3,30}$'),
  display_name text not null check (char_length(btrim(display_name)) between 1 and 30),
  -- avatars バケット内のパス（{user_id}/...）。デモデータのみ外部 URL を入れる
  avatar_url text check (char_length(avatar_url) <= 500),
  bio text not null default '' check (char_length(bio) <= 300),
  location text not null default '' check (char_length(location) <= 30),
  genre text not null default '' check (char_length(genre) <= 30),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- サインアップ時に profiles を自動作成する。
-- 表示名などは signUp の options.data（raw_user_meta_data）から受け取り、長さを切り詰めて保存する。
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  base_username text;
begin
  base_username := left(
    regexp_replace(lower(split_part(coalesce(new.email, ''), '@', 1)), '[^a-z0-9_]', '', 'g'),
    20
  );
  if char_length(base_username) < 3 then
    base_username := 'user';
  end if;

  insert into public.profiles (id, username, display_name, location, genre)
  values (
    new.id,
    -- ID の先頭 8 桁を付けて一意にする
    base_username || '_' || left(replace(new.id::text, '-', ''), 8),
    coalesce(nullif(left(btrim(new.raw_user_meta_data ->> 'display_name'), 30), ''), base_username),
    coalesce(left(btrim(new.raw_user_meta_data ->> 'location'), 30), ''),
    coalesce(left(btrim(new.raw_user_meta_data ->> 'genre'), 30), '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- follows: フォロー関係
-- ---------------------------------------------------------------------------
create table public.follows (
  follower_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  followee_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followee_id),
  check (follower_id <> followee_id)
);

create index follows_followee_id_idx on public.follows (followee_id);

-- ---------------------------------------------------------------------------
-- listings: 端材・素材の出品
-- ---------------------------------------------------------------------------
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 40),
  description text not null check (char_length(btrim(description)) between 1 and 1000),
  price integer not null check (price between 1 and 9999999),
  category text not null
    check (category in ('wood', 'glass', 'fabric', 'acrylic', 'leather', 'metal', 'paper', 'other')),
  -- active: 公開中 / sold: 売り切れ（将来の購入機能用）/ hidden: 出品者のみ閲覧可
  status text not null default 'active' check (status in ('active', 'sold', 'hidden')),
  size text check (char_length(size) <= 50),
  weight text check (char_length(weight) <= 50),
  condition text check (condition in ('new', 'likeNew', 'good', 'fair', 'poor')),
  shipping_methods text[] not null
    check (cardinality(shipping_methods) >= 1 and shipping_methods <@ array['delivery', 'post']::text[]),
  -- favorites のトリガーで更新する。利用者は直接書き換えられない（GRANT で除外）
  favorite_count integer not null default 0 check (favorite_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index listings_seller_id_idx on public.listings (seller_id);
create index listings_category_created_at_idx on public.listings (category, created_at desc);
create index listings_created_at_idx on public.listings (created_at desc);
create index listings_favorite_count_idx on public.listings (favorite_count desc, created_at desc);

-- お気に入り数の増減で updated_at が変わらないよう、内容の列の更新時だけ発火させる
create trigger listings_set_updated_at
before update of title, description, price, category, status, size, weight, condition, shipping_methods
on public.listings
for each row execute function public.set_updated_at();

create table public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  -- listing-images バケット内のパス（{user_id}/...）
  storage_path text not null check (char_length(storage_path) between 1 and 500),
  sort_order smallint not null default 0 check (sort_order between 0 and 5),
  created_at timestamptz not null default now(),
  -- 並び順の重複を防ぎ、sort_order の範囲と合わせて 1 商品 6 枚までに制限する
  unique (listing_id, sort_order)
);

-- ---------------------------------------------------------------------------
-- gallery_posts: 作品投稿（出品とは独立した機能）
-- ---------------------------------------------------------------------------
create table public.gallery_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 40),
  description text not null default '' check (char_length(description) <= 1000),
  category text not null
    check (category in ('wood', 'glass', 'fabric', 'acrylic', 'leather', 'metal', 'paper', 'other')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index gallery_posts_author_id_idx on public.gallery_posts (author_id);
create index gallery_posts_category_created_at_idx on public.gallery_posts (category, created_at desc);
create index gallery_posts_created_at_idx on public.gallery_posts (created_at desc);

create trigger gallery_posts_set_updated_at
before update on public.gallery_posts
for each row execute function public.set_updated_at();

create table public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  gallery_post_id uuid not null references public.gallery_posts (id) on delete cascade,
  -- gallery-images バケット内のパス（{user_id}/...）
  storage_path text not null check (char_length(storage_path) between 1 and 500),
  sort_order smallint not null default 0 check (sort_order between 0 and 3),
  created_at timestamptz not null default now(),
  unique (gallery_post_id, sort_order)
);

-- ---------------------------------------------------------------------------
-- favorites / cart_items
-- ---------------------------------------------------------------------------
create table public.favorites (
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

create index favorites_listing_id_idx on public.favorites (listing_id);

-- 他人のお気に入りは RLS で読めないため、人気順に使う件数は SECURITY DEFINER のトリガーで集計する
create or replace function public.sync_listing_favorite_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.listings set favorite_count = favorite_count + 1 where id = new.listing_id;
  else
    update public.listings set favorite_count = greatest(favorite_count - 1, 0) where id = old.listing_id;
  end if;
  return null;
end;
$$;

create trigger favorites_sync_listing_favorite_count
after insert or delete on public.favorites
for each row execute function public.sync_listing_favorite_count();

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  quantity integer not null default 1 check (quantity between 1 and 99),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, listing_id)
);

create index cart_items_listing_id_idx on public.cart_items (listing_id);

create trigger cart_items_set_updated_at
before update on public.cart_items
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- チャット
-- ---------------------------------------------------------------------------
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings (id) on delete set null,
  created_at timestamptz not null default now(),
  -- 最後のメッセージ時刻。会話一覧の並び順に使う
  updated_at timestamptz not null default now()
);

create index conversations_listing_id_idx on public.conversations (listing_id);

create table public.conversation_members (
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create index conversation_members_user_id_idx on public.conversation_members (user_id);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  -- 送信者は常にログイン中のユーザー。GRANT で列を除外し、クライアントから指定させない
  sender_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  content text not null check (char_length(btrim(content)) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index messages_conversation_id_created_at_idx on public.messages (conversation_id, created_at);
create index messages_sender_id_idx on public.messages (sender_id);

create or replace function public.touch_conversation_on_message()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.conversations set updated_at = new.created_at where id = new.conversation_id;
  return null;
end;
$$;

create trigger messages_touch_conversation
after insert on public.messages
for each row execute function public.touch_conversation_on_message();

-- RLS ポリシーから参照する。conversation_members 自身のポリシーから呼んでも再帰しないよう SECURITY DEFINER にする
create or replace function public.is_conversation_member(p_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.conversation_members
    where conversation_id = p_conversation_id
      and user_id = (select auth.uid())
  );
$$;

-- ---------------------------------------------------------------------------
-- ビュー
-- ---------------------------------------------------------------------------
-- security_invoker により、呼び出したユーザーの権限（RLS）で集計する
create view public.profile_stats
with (security_invoker = true)
as
select
  p.id,
  (select count(*) from public.follows f where f.followee_id = p.id)::integer as follower_count,
  (select count(*) from public.follows f where f.follower_id = p.id)::integer as following_count
from public.profiles p;

-- ---------------------------------------------------------------------------
-- RPC
-- ---------------------------------------------------------------------------
-- 商品と画像を 1 トランザクションで登録する。呼び出したユーザーの権限（RLS）で実行される
create or replace function public.create_listing(
  p_title text,
  p_description text,
  p_price integer,
  p_category text,
  p_size text,
  p_weight text,
  p_condition text,
  p_shipping_methods text[],
  p_image_paths text[]
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  new_id uuid;
begin
  if coalesce(cardinality(p_image_paths), 0) > 6 then
    raise exception using errcode = '22023', message = '画像は6枚までです';
  end if;

  insert into public.listings (title, description, price, category, size, weight, condition, shipping_methods)
  values (
    btrim(p_title),
    btrim(p_description),
    p_price,
    p_category,
    nullif(btrim(p_size), ''),
    nullif(btrim(p_weight), ''),
    p_condition,
    p_shipping_methods
  )
  returning id into new_id;

  insert into public.listing_images (listing_id, storage_path, sort_order)
  select new_id, image.path, (image.position - 1)::smallint
  from unnest(coalesce(p_image_paths, '{}'::text[])) with ordinality as image(path, position);

  return new_id;
end;
$$;

create or replace function public.create_gallery_post(
  p_title text,
  p_description text,
  p_category text,
  p_image_paths text[]
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  new_id uuid;
begin
  if coalesce(cardinality(p_image_paths), 0) not between 1 and 4 then
    raise exception using errcode = '22023', message = '写真は1〜4枚で投稿してください';
  end if;

  insert into public.gallery_posts (title, description, category)
  values (btrim(p_title), btrim(coalesce(p_description, '')), p_category)
  returning id into new_id;

  insert into public.gallery_images (gallery_post_id, storage_path, sort_order)
  select new_id, image.path, (image.position - 1)::smallint
  from unnest(p_image_paths) with ordinality as image(path, position);

  return new_id;
end;
$$;

-- 会話を開始する（同じ相手・同じ商品の会話があればそれを返す）。
-- 参加者の追加をクライアントに許すと他人を勝手に会話へ入れられるため、この関数でのみ作成する。
create or replace function public.start_conversation(p_other_user_id uuid, p_listing_id uuid default null)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
  v_conversation_id uuid;
begin
  if me is null then
    raise exception using errcode = '42501', message = 'ログインが必要です';
  end if;
  if p_other_user_id = me then
    raise exception using errcode = '22023', message = '自分自身とは会話できません';
  end if;
  if not exists (select 1 from public.profiles where id = p_other_user_id) then
    raise exception using errcode = 'P0002', message = 'ユーザーが見つかりません';
  end if;
  -- 商品についての会話は、その商品の出品者が参加者に含まれる場合に限る
  if p_listing_id is not null and not exists (
    select 1
    from public.listings
    where id = p_listing_id
      and seller_id in (me, p_other_user_id)
      and (status <> 'hidden' or seller_id = me)
  ) then
    raise exception using errcode = 'P0002', message = '商品が見つかりません';
  end if;

  -- 同時に呼ばれても同じ組み合わせの会話が重複しないよう、組み合わせ単位でロックする
  perform pg_advisory_xact_lock(
    hashtextextended(
      least(me, p_other_user_id)::text || greatest(me, p_other_user_id)::text || coalesce(p_listing_id::text, ''),
      0
    )
  );

  select c.id into v_conversation_id
  from public.conversations c
  join public.conversation_members a on a.conversation_id = c.id and a.user_id = me
  join public.conversation_members b on b.conversation_id = c.id and b.user_id = p_other_user_id
  where c.listing_id is not distinct from p_listing_id
  limit 1;

  if v_conversation_id is null then
    insert into public.conversations (listing_id) values (p_listing_id) returning id into v_conversation_id;
    insert into public.conversation_members (conversation_id, user_id)
    values (v_conversation_id, me), (v_conversation_id, p_other_user_id);
  end if;

  return v_conversation_id;
end;
$$;

-- 会話一覧（相手・商品・最後のメッセージ付き）。呼び出したユーザーの権限（RLS）で実行される
create or replace function public.get_my_conversations(p_conversation_id uuid default null)
returns table (
  id uuid,
  updated_at timestamptz,
  listing_id uuid,
  listing_title text,
  listing_price integer,
  listing_image_path text,
  other_user_id uuid,
  other_display_name text,
  other_avatar_url text,
  other_location text,
  other_genre text,
  last_message_id uuid,
  last_message_sender_id uuid,
  last_message_content text,
  last_message_created_at timestamptz
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    c.id,
    c.updated_at,
    l.id,
    l.title,
    l.price,
    (
      select li.storage_path
      from public.listing_images li
      where li.listing_id = l.id
      order by li.sort_order
      limit 1
    ),
    o.id,
    o.display_name,
    o.avatar_url,
    o.location,
    o.genre,
    m.id,
    m.sender_id,
    m.content,
    m.created_at
  from public.conversation_members mine
  join public.conversations c on c.id = mine.conversation_id
  join public.conversation_members other_member
    on other_member.conversation_id = c.id and other_member.user_id <> mine.user_id
  join public.profiles o on o.id = other_member.user_id
  left join public.listings l on l.id = c.listing_id
  left join lateral (
    select msg.id, msg.sender_id, msg.content, msg.created_at
    from public.messages msg
    where msg.conversation_id = c.id
    order by msg.created_at desc, msg.id desc
    limit 1
  ) m on true
  where mine.user_id = (select auth.uid())
    and (p_conversation_id is null or c.id = p_conversation_id)
  order by c.updated_at desc;
$$;

-- ---------------------------------------------------------------------------
-- 権限（GRANT）
-- Supabase の既定の付与に依存せず、必要な操作だけを明示的に許可する。
-- 実際にどの行へ操作できるかは RLS ポリシーで制御する。
-- ---------------------------------------------------------------------------
revoke all on
  public.profiles,
  public.follows,
  public.listings,
  public.listing_images,
  public.gallery_posts,
  public.gallery_images,
  public.favorites,
  public.cart_items,
  public.conversations,
  public.conversation_members,
  public.messages,
  public.profile_stats
from anon, authenticated;

grant select on
  public.profiles,
  public.follows,
  public.listings,
  public.listing_images,
  public.gallery_posts,
  public.gallery_images,
  public.profile_stats
to anon, authenticated;

-- id / created_at / 集計列 / 所有者の列は書き換えさせない
grant update (username, display_name, avatar_url, bio, location, genre) on public.profiles to authenticated;
grant insert (followee_id), delete on public.follows to authenticated;
grant insert (title, description, price, category, status, size, weight, condition, shipping_methods),
      update (title, description, price, category, status, size, weight, condition, shipping_methods),
      delete
  on public.listings to authenticated;
grant insert (listing_id, storage_path, sort_order), delete on public.listing_images to authenticated;
grant insert (title, description, category), update (title, description, category), delete
  on public.gallery_posts to authenticated;
grant insert (gallery_post_id, storage_path, sort_order), delete on public.gallery_images to authenticated;
grant select, insert (listing_id), delete on public.favorites to authenticated;
grant select, insert (listing_id, quantity), update (quantity), delete on public.cart_items to authenticated;
grant select on public.conversations, public.conversation_members to authenticated;
grant select, insert (conversation_id, content) on public.messages to authenticated;

-- 関数は既定で PUBLIC に実行権限があるため、一度取り消してから必要なものだけ許可する
revoke execute on function
  public.set_updated_at(),
  public.handle_new_user(),
  public.sync_listing_favorite_count(),
  public.touch_conversation_on_message(),
  public.is_conversation_member(uuid),
  public.create_listing(text, text, integer, text, text, text, text, text[], text[]),
  public.create_gallery_post(text, text, text, text[]),
  public.start_conversation(uuid, uuid),
  public.get_my_conversations(uuid)
from public, anon, authenticated;

grant execute on function
  public.is_conversation_member(uuid),
  public.create_listing(text, text, integer, text, text, text, text, text[], text[]),
  public.create_gallery_post(text, text, text, text[]),
  public.start_conversation(uuid, uuid),
  public.get_my_conversations(uuid)
to authenticated;
