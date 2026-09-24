-- 新規登録画面で自己紹介も入力できるようにしたため、signUp の options.data（raw_user_meta_data）の bio も
-- profiles に保存する。それ以外の処理は 20260924000001_initial_schema.sql の handle_new_user と同じ。
-- create or replace は既存の実行権限（anon / authenticated から取り消し済み）をそのまま引き継ぐ。
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

  insert into public.profiles (id, username, display_name, location, genre, bio)
  values (
    new.id,
    -- ID の先頭 8 桁を付けて一意にする
    base_username || '_' || left(replace(new.id::text, '-', ''), 8),
    coalesce(nullif(left(btrim(new.raw_user_meta_data ->> 'display_name'), 30), ''), base_username),
    coalesce(left(btrim(new.raw_user_meta_data ->> 'location'), 30), ''),
    coalesce(left(btrim(new.raw_user_meta_data ->> 'genre'), 30), ''),
    coalesce(left(btrim(new.raw_user_meta_data ->> 'bio'), 300), '')
  );
  return new;
end;
$$;
