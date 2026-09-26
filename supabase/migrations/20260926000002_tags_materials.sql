-- 出品のハッシュタグと、作品に使った端材（素材）の記録。
-- ハッシュタグは「#」を除いて小文字にした文字列で保存し、検索・関連作品の判定は完全一致で行う。

-- ---------------------------------------------------------------------------
-- ハッシュタグの形式: 1〜20 文字、空白・「#」・「,」を含まない、小文字、重複なし、10 個まで
-- CHECK 制約では副問い合わせを使えないため関数にまとめる
-- ---------------------------------------------------------------------------
create or replace function public.is_valid_tags(p_tags text[])
returns boolean
language sql
immutable
set search_path = ''
as $$
  select
    coalesce(cardinality(p_tags), 0) <= 10
    and not exists (
      select 1 from unnest(p_tags) as tag
      where tag is null or tag !~ '^[^[:space:]#＃,、]{1,20}$' or tag <> lower(tag)
    )
    and coalesce(cardinality(p_tags), 0) = (select count(distinct tag) from unnest(p_tags) as tag);
$$;

alter table public.listings
  add column tags text[] not null default '{}' check (public.is_valid_tags(tags));

create index listings_tags_idx on public.listings using gin (tags);

grant insert (tags), update (tags) on public.listings to authenticated;

-- 引数を増やすため作り直す。既存の呼び出し（p_tags なし）はそのまま動くよう既定値を付ける
drop function public.create_listing(text, text, integer, text, text, text, text, text[], text[]);

create function public.create_listing(
  p_title text,
  p_description text,
  p_price integer,
  p_category text,
  p_size text,
  p_weight text,
  p_condition text,
  p_shipping_methods text[],
  p_image_paths text[],
  p_tags text[] default '{}'
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

  insert into public.listings (title, description, price, category, size, weight, condition, shipping_methods, tags)
  values (
    btrim(p_title),
    btrim(p_description),
    p_price,
    p_category,
    nullif(btrim(p_size), ''),
    nullif(btrim(p_weight), ''),
    p_condition,
    p_shipping_methods,
    coalesce(p_tags, '{}')
  )
  returning id into new_id;

  insert into public.listing_images (listing_id, storage_path, sort_order)
  select new_id, image.path, (image.position - 1)::smallint
  from unnest(coalesce(p_image_paths, '{}'::text[])) with ordinality as image(path, position);

  return new_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- gallery_post_materials: 作品に使った端材
-- 購入した出品から選んだものは listing_id を持ち、名前・画像・ハッシュタグは投稿時点の出品の内容を写す。
-- 手入力したものは投稿者がアップロードした画像（gallery-images）と、入力したハッシュタグを持つ。
-- ---------------------------------------------------------------------------
create table public.gallery_post_materials (
  id uuid primary key default gen_random_uuid(),
  gallery_post_id uuid not null references public.gallery_posts (id) on delete cascade,
  listing_id uuid references public.listings (id) on delete set null,
  name text not null check (char_length(btrim(name)) between 1 and 40),
  image_bucket text check (image_bucket in ('listing-images', 'gallery-images')),
  image_path text check (char_length(image_path) <= 500),
  tags text[] not null default '{}' check (public.is_valid_tags(tags)),
  sort_order smallint not null default 0 check (sort_order between 0 and 9),
  created_at timestamptz not null default now(),
  -- 並び順の重複を防ぎ、sort_order の範囲と合わせて 1 作品 10 個までに制限する
  unique (gallery_post_id, sort_order),
  check ((image_bucket is null) = (image_path is null))
);

create index gallery_post_materials_gallery_post_id_idx on public.gallery_post_materials (gallery_post_id);
create index gallery_post_materials_listing_id_idx on public.gallery_post_materials (listing_id);
create index gallery_post_materials_tags_idx on public.gallery_post_materials using gin (tags);

revoke all on public.gallery_post_materials from anon, authenticated;
grant select on public.gallery_post_materials to anon, authenticated;
grant insert (gallery_post_id, listing_id, name, image_bucket, image_path, tags, sort_order), delete
  on public.gallery_post_materials to authenticated;

alter table public.gallery_post_materials enable row level security;

create policy "gallery_post_materials: anyone can read"
on public.gallery_post_materials for select
to anon, authenticated
using (true);

-- 画像は自分のフォルダの画像か、紐付けた出品の画像に限る（他人の画像を勝手に使わせない）
create policy "gallery_post_materials: authors can add materials to their own posts"
on public.gallery_post_materials for insert
to authenticated
with check (
  exists (select 1 from public.gallery_posts p where p.id = gallery_post_id and p.author_id = (select auth.uid()))
  and (
    image_path is null
    or (image_bucket = 'gallery-images' and image_path like (select auth.uid())::text || '/%')
    or (
      image_bucket = 'listing-images'
      and exists (
        select 1 from public.listing_images i
        where i.listing_id = gallery_post_materials.listing_id and i.storage_path = gallery_post_materials.image_path
      )
    )
  )
);

create policy "gallery_post_materials: authors can delete materials of their own posts"
on public.gallery_post_materials for delete
to authenticated
using (exists (select 1 from public.gallery_posts p where p.id = gallery_post_id and p.author_id = (select auth.uid())));

-- 引数を増やすため作り直す。p_materials は [{ listing_id?, name, image_path?, tags? }] の配列
drop function public.create_gallery_post(text, text, text, text[]);

create function public.create_gallery_post(
  p_title text,
  p_description text,
  p_category text,
  p_image_paths text[],
  p_materials jsonb default '[]'
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  new_id uuid;
  material jsonb;
  material_position bigint;
  material_listing_id uuid;
  listing_title text;
  listing_tags text[];
  material_image text;
begin
  if coalesce(cardinality(p_image_paths), 0) not between 1 and 4 then
    raise exception using errcode = '22023', message = '写真は1〜4枚で投稿してください';
  end if;
  if jsonb_typeof(coalesce(p_materials, '[]')) <> 'array' or jsonb_array_length(coalesce(p_materials, '[]')) > 10 then
    raise exception using errcode = '22023', message = '使用した端材は10個まで登録できます';
  end if;

  insert into public.gallery_posts (title, description, category)
  values (btrim(p_title), btrim(coalesce(p_description, '')), p_category)
  returning id into new_id;

  insert into public.gallery_images (gallery_post_id, storage_path, sort_order)
  select new_id, image.path, (image.position - 1)::smallint
  from unnest(p_image_paths) with ordinality as image(path, position);

  for material, material_position in
    select value, ordinality from jsonb_array_elements(coalesce(p_materials, '[]')) with ordinality
  loop
    material_listing_id := nullif(material ->> 'listing_id', '')::uuid;

    if material_listing_id is not null then
      -- 出品から選んだ端材は、画像とハッシュタグをクライアントから受け取らず出品から写す
      select l.title, l.tags,
        (select i.storage_path from public.listing_images i where i.listing_id = l.id order by i.sort_order limit 1)
      into listing_title, listing_tags, material_image
      from public.listings l
      where l.id = material_listing_id;

      if not found then
        raise exception using errcode = 'P0001', message = '使用した端材の出品が見つかりません';
      end if;

      insert into public.gallery_post_materials (gallery_post_id, listing_id, name, image_bucket, image_path, tags, sort_order)
      values (
        new_id,
        material_listing_id,
        left(coalesce(nullif(btrim(material ->> 'name'), ''), listing_title), 40),
        case when material_image is null then null else 'listing-images' end,
        material_image,
        listing_tags,
        (material_position - 1)::smallint
      );
    else
      material_image := nullif(material ->> 'image_path', '');
      insert into public.gallery_post_materials (gallery_post_id, name, image_bucket, image_path, tags, sort_order)
      values (
        new_id,
        btrim(coalesce(material ->> 'name', '')),
        case when material_image is null then null else 'gallery-images' end,
        material_image,
        coalesce(array(select jsonb_array_elements_text(coalesce(material -> 'tags', '[]'))), '{}'),
        (material_position - 1)::smallint
      );
    end if;
  end loop;

  return new_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- get_related_gallery_posts: 出品と同じ端材・同じハッシュタグの端材を使った作品
-- その出品自体を使った作品を最優先し、次に共通するハッシュタグが多い順に並べる
-- ---------------------------------------------------------------------------
create or replace function public.get_related_gallery_posts(p_listing_id uuid, p_limit integer default 10)
returns table (gallery_post_id uuid, score integer)
language sql
stable
security invoker
set search_path = ''
as $$
  select m.gallery_post_id, max(
    case when m.listing_id = l.id then 100 else 0 end
    + (select count(*) from unnest(m.tags) as tag where tag = any (l.tags))
  )::integer as score
  from public.listings l
  join public.gallery_post_materials m on m.listing_id = l.id or m.tags && l.tags
  join public.gallery_posts p on p.id = m.gallery_post_id
  where l.id = p_listing_id
  group by m.gallery_post_id
  order by score desc, max(p.created_at) desc
  limit least(greatest(coalesce(p_limit, 10), 1), 30);
$$;

-- ---------------------------------------------------------------------------
-- 関数の権限
-- ---------------------------------------------------------------------------
revoke execute on function
  public.create_listing(text, text, integer, text, text, text, text, text[], text[], text[]),
  public.create_gallery_post(text, text, text, text[], jsonb),
  public.get_related_gallery_posts(uuid, integer)
from public, anon, authenticated;

grant execute on function
  public.create_listing(text, text, integer, text, text, text, text, text[], text[], text[]),
  public.create_gallery_post(text, text, text, text[], jsonb)
to authenticated;

-- 関連作品は未ログインでも見られる
grant execute on function public.get_related_gallery_posts(uuid, integer) to anon, authenticated;
