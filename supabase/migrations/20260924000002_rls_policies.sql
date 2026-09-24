-- Row Level Security
-- クライアントからの直接アクセス（ブラウザで Supabase API を叩く場合も含む）を DB 側で制限する。
-- auth.uid() は行ごとに再評価されないよう (select auth.uid()) の形で書く。

alter table public.profiles enable row level security;
alter table public.follows enable row level security;
alter table public.listings enable row level security;
alter table public.listing_images enable row level security;
alter table public.gallery_posts enable row level security;
alter table public.gallery_images enable row level security;
alter table public.favorites enable row level security;
alter table public.cart_items enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;

-- ---------------------------------------------------------------------------
-- profiles: 公開プロフィールは誰でも閲覧可。更新は本人のみ。作成はサインアップ時のトリガーのみ
-- （メールアドレスなどの非公開情報は auth.users 側にあり、profiles には置かない）
-- ---------------------------------------------------------------------------
create policy "profiles: anyone can read"
on public.profiles for select
to anon, authenticated
using (true);

create policy "profiles: users can update their own profile"
on public.profiles for update
to authenticated
using (id = (select auth.uid()))
with check (
  id = (select auth.uid())
  -- アバターは自分のフォルダにアップロードした画像のみ指定できる
  and (avatar_url is null or avatar_url like (select auth.uid())::text || '/%')
);

-- ---------------------------------------------------------------------------
-- follows: 関係は公開。フォロー・解除は本人のみ
-- ---------------------------------------------------------------------------
create policy "follows: anyone can read"
on public.follows for select
to anon, authenticated
using (true);

create policy "follows: users can follow as themselves"
on public.follows for insert
to authenticated
with check (follower_id = (select auth.uid()));

create policy "follows: users can unfollow as themselves"
on public.follows for delete
to authenticated
using (follower_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- listings: 公開中（active / sold）は誰でも閲覧可。hidden は出品者のみ。変更は出品者のみ
-- ---------------------------------------------------------------------------
create policy "listings: public listings and own listings are readable"
on public.listings for select
to anon, authenticated
using (status in ('active', 'sold') or seller_id = (select auth.uid()));

create policy "listings: users can create listings as themselves"
on public.listings for insert
to authenticated
with check (seller_id = (select auth.uid()));

create policy "listings: sellers can update their own listings"
on public.listings for update
to authenticated
using (seller_id = (select auth.uid()))
with check (seller_id = (select auth.uid()));

create policy "listings: sellers can delete their own listings"
on public.listings for delete
to authenticated
using (seller_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- listing_images: 親の商品が見える場合のみ閲覧可。追加・削除は出品者のみ
-- ---------------------------------------------------------------------------
create policy "listing_images: readable when the listing is readable"
on public.listing_images for select
to anon, authenticated
using (exists (select 1 from public.listings l where l.id = listing_id));

create policy "listing_images: sellers can add images to their own listings"
on public.listing_images for insert
to authenticated
with check (
  exists (select 1 from public.listings l where l.id = listing_id and l.seller_id = (select auth.uid()))
  -- 他人がアップロードした画像を自分の商品に使わせない
  and storage_path like (select auth.uid())::text || '/%'
);

create policy "listing_images: sellers can delete images of their own listings"
on public.listing_images for delete
to authenticated
using (exists (select 1 from public.listings l where l.id = listing_id and l.seller_id = (select auth.uid())));

-- ---------------------------------------------------------------------------
-- gallery_posts / gallery_images: 投稿は公開。変更は投稿者のみ
-- ---------------------------------------------------------------------------
create policy "gallery_posts: anyone can read"
on public.gallery_posts for select
to anon, authenticated
using (true);

create policy "gallery_posts: users can create posts as themselves"
on public.gallery_posts for insert
to authenticated
with check (author_id = (select auth.uid()));

create policy "gallery_posts: authors can update their own posts"
on public.gallery_posts for update
to authenticated
using (author_id = (select auth.uid()))
with check (author_id = (select auth.uid()));

create policy "gallery_posts: authors can delete their own posts"
on public.gallery_posts for delete
to authenticated
using (author_id = (select auth.uid()));

create policy "gallery_images: anyone can read"
on public.gallery_images for select
to anon, authenticated
using (true);

create policy "gallery_images: authors can add images to their own posts"
on public.gallery_images for insert
to authenticated
with check (
  exists (select 1 from public.gallery_posts p where p.id = gallery_post_id and p.author_id = (select auth.uid()))
  and storage_path like (select auth.uid())::text || '/%'
);

create policy "gallery_images: authors can delete images of their own posts"
on public.gallery_images for delete
to authenticated
using (
  exists (select 1 from public.gallery_posts p where p.id = gallery_post_id and p.author_id = (select auth.uid()))
);

-- ---------------------------------------------------------------------------
-- favorites: 自分のお気に入りのみ。自分の商品・非公開の商品は登録できない
-- ---------------------------------------------------------------------------
create policy "favorites: users can read their own favorites"
on public.favorites for select
to authenticated
using (user_id = (select auth.uid()));

create policy "favorites: users can add their own favorites"
on public.favorites for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.listings l
    where l.id = listing_id and l.status = 'active' and l.seller_id <> (select auth.uid())
  )
);

create policy "favorites: users can remove their own favorites"
on public.favorites for delete
to authenticated
using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- cart_items: 自分のカートのみ。自分の商品・販売中でない商品は追加できない
-- ---------------------------------------------------------------------------
create policy "cart_items: users can read their own cart"
on public.cart_items for select
to authenticated
using (user_id = (select auth.uid()));

create policy "cart_items: users can add to their own cart"
on public.cart_items for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.listings l
    where l.id = listing_id and l.status = 'active' and l.seller_id <> (select auth.uid())
  )
);

create policy "cart_items: users can update their own cart"
on public.cart_items for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "cart_items: users can remove from their own cart"
on public.cart_items for delete
to authenticated
using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- チャット: 参加者のみ閲覧・送信可。会話と参加者の作成は start_conversation() のみ
-- メッセージの編集・削除は許可しない
-- ---------------------------------------------------------------------------
create policy "conversations: members can read"
on public.conversations for select
to authenticated
using (public.is_conversation_member(id));

create policy "conversation_members: members can read members of their conversations"
on public.conversation_members for select
to authenticated
using (public.is_conversation_member(conversation_id));

create policy "messages: members can read"
on public.messages for select
to authenticated
using (public.is_conversation_member(conversation_id));

create policy "messages: members can send as themselves"
on public.messages for insert
to authenticated
with check (
  sender_id = (select auth.uid())
  and public.is_conversation_member(conversation_id)
);
