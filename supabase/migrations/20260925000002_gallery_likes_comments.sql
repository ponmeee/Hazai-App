-- ギャラリーの「いいね」と「コメント」を保存する。
-- 件数は他人の行を数える必要があるため、SECURITY DEFINER のトリガーで gallery_posts の集計列に反映する
-- （favorites → listings.favorite_count と同じ方式）。集計列は GRANT していないため利用者は書き換えられない。

alter table public.gallery_posts
  add column like_count integer not null default 0 check (like_count >= 0),
  add column comment_count integer not null default 0 check (comment_count >= 0);

-- ---------------------------------------------------------------------------
-- gallery_likes: いいね（ユーザー × 作品で一意）
-- ---------------------------------------------------------------------------
create table public.gallery_likes (
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  gallery_post_id uuid not null references public.gallery_posts (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, gallery_post_id)
);

create index gallery_likes_gallery_post_id_idx on public.gallery_likes (gallery_post_id);

create or replace function public.sync_gallery_post_like_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.gallery_posts set like_count = like_count + 1 where id = new.gallery_post_id;
  else
    update public.gallery_posts set like_count = greatest(like_count - 1, 0) where id = old.gallery_post_id;
  end if;
  return null;
end;
$$;

create trigger gallery_likes_sync_like_count
after insert or delete on public.gallery_likes
for each row execute function public.sync_gallery_post_like_count();

-- ---------------------------------------------------------------------------
-- gallery_comments: コメント（編集は不可。削除はコメントした本人か作品の投稿者）
-- ---------------------------------------------------------------------------
create table public.gallery_comments (
  id uuid primary key default gen_random_uuid(),
  gallery_post_id uuid not null references public.gallery_posts (id) on delete cascade,
  author_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  content text not null check (char_length(btrim(content)) between 1 and 500),
  created_at timestamptz not null default now()
);

create index gallery_comments_gallery_post_id_created_at_idx on public.gallery_comments (gallery_post_id, created_at);
create index gallery_comments_author_id_idx on public.gallery_comments (author_id);

create or replace function public.sync_gallery_post_comment_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.gallery_posts set comment_count = comment_count + 1 where id = new.gallery_post_id;
  else
    update public.gallery_posts set comment_count = greatest(comment_count - 1, 0) where id = old.gallery_post_id;
  end if;
  return null;
end;
$$;

create trigger gallery_comments_sync_comment_count
after insert or delete on public.gallery_comments
for each row execute function public.sync_gallery_post_comment_count();

-- ---------------------------------------------------------------------------
-- プロフィールの「いいね」数（自分の作品が受け取ったいいねの合計）を集計に加える
-- ---------------------------------------------------------------------------
create or replace view public.profile_stats
with (security_invoker = true)
as
select
  p.id,
  (select count(*) from public.follows f where f.followee_id = p.id)::integer as follower_count,
  (select count(*) from public.follows f where f.follower_id = p.id)::integer as following_count,
  (select coalesce(sum(g.like_count), 0) from public.gallery_posts g where g.author_id = p.id)::integer as like_count
from public.profiles p;

-- ---------------------------------------------------------------------------
-- 権限
-- ---------------------------------------------------------------------------
revoke all on public.gallery_likes, public.gallery_comments from anon, authenticated;

-- いいねは本人の分だけ読める（誰がいいねしたかは公開しない）。件数は gallery_posts.like_count で公開する
grant select, insert (gallery_post_id), delete on public.gallery_likes to authenticated;
-- コメントは作品と同じく公開
grant select on public.gallery_comments to anon, authenticated;
grant insert (gallery_post_id, content), delete on public.gallery_comments to authenticated;

revoke execute on function
  public.sync_gallery_post_like_count(),
  public.sync_gallery_post_comment_count()
from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.gallery_likes enable row level security;
alter table public.gallery_comments enable row level security;

create policy "gallery_likes: users can read their own likes"
on public.gallery_likes for select
to authenticated
using (user_id = (select auth.uid()));

create policy "gallery_likes: users can like as themselves"
on public.gallery_likes for insert
to authenticated
with check (user_id = (select auth.uid()));

create policy "gallery_likes: users can remove their own likes"
on public.gallery_likes for delete
to authenticated
using (user_id = (select auth.uid()));

create policy "gallery_comments: anyone can read"
on public.gallery_comments for select
to anon, authenticated
using (true);

create policy "gallery_comments: users can comment as themselves"
on public.gallery_comments for insert
to authenticated
with check (author_id = (select auth.uid()));

-- 作品の投稿者は、自分の作品に付いた不適切なコメントを消せる
create policy "gallery_comments: comment authors and post authors can delete"
on public.gallery_comments for delete
to authenticated
using (
  author_id = (select auth.uid())
  or exists (
    select 1 from public.gallery_posts p
    where p.id = gallery_post_id and p.author_id = (select auth.uid())
  )
);
