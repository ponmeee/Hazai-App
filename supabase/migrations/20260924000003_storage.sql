-- Storage バケットとポリシー
-- ファイルは {user_id}/{ファイル名} に置き、先頭のフォルダが本人の ID の場合のみ書き込みを許可する。
-- 画像は公開 URL で配信するため、バケットは public（読み取りに RLS を通さない）にする。

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp']),
  ('listing-images', 'listing-images', true, 8388608, array['image/jpeg', 'image/png', 'image/webp']),
  ('gallery-images', 'gallery-images', true, 8388608, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 削除・上書きの際に Storage API が対象を参照するため、自分のファイルに限り一覧も許可する
create policy "hazai: users can read their own files"
on storage.objects for select
to authenticated
using (
  bucket_id in ('avatars', 'listing-images', 'gallery-images')
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "hazai: users can upload to their own folder"
on storage.objects for insert
to authenticated
with check (
  bucket_id in ('avatars', 'listing-images', 'gallery-images')
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "hazai: users can update their own files"
on storage.objects for update
to authenticated
using (
  bucket_id in ('avatars', 'listing-images', 'gallery-images')
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id in ('avatars', 'listing-images', 'gallery-images')
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "hazai: users can delete their own files"
on storage.objects for delete
to authenticated
using (
  bucket_id in ('avatars', 'listing-images', 'gallery-images')
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
