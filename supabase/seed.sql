-- ローカル開発用のデモデータ（`supabase db reset` で自動投入される）。
-- 本番プロジェクトでは実行しないこと（全デモアカウントのパスワードが公開されている）。
-- デモアカウントのパスワード: hazai-demo
-- このファイルは server/src/db/seedData.ts（旧ローカルサーバー）から生成した。

-- auth.users への追加で public.profiles がトリガーにより作成される
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('00000000-0000-0000-0000-000000000000', 'd0000001-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'mio@demo.hazai.test', extensions.crypt('hazai-demo', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', jsonb_build_object('display_name', '佐藤 みお', 'location', '東京都', 'genre', '木工・家具'), now(), now(), '', '', '', '');
insert into auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (gen_random_uuid(), 'd0000001-0000-4000-8000-000000000001', 'd0000001-0000-4000-8000-000000000001', jsonb_build_object('sub', 'd0000001-0000-4000-8000-000000000001', 'email', 'mio@demo.hazai.test', 'email_verified', true), 'email', now(), now(), now());
update public.profiles set avatar_url = 'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?w=200&q=75&auto=format&fit=crop', bio = '美大で家具デザインを専攻しています。制作で出た端材を、次の誰かの素材に。小さなスツールや器を中心につくっています。' where id = 'd0000001-0000-4000-8000-000000000001';

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('00000000-0000-0000-0000-000000000000', 'd0000001-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'saki@demo.hazai.test', extensions.crypt('hazai-demo', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', jsonb_build_object('display_name', '高橋 さき', 'location', '京都府', 'genre', 'ガラス工芸'), now(), now(), '', '', '', '');
insert into auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (gen_random_uuid(), 'd0000001-0000-4000-8000-000000000002', 'd0000001-0000-4000-8000-000000000002', jsonb_build_object('sub', 'd0000001-0000-4000-8000-000000000002', 'email', 'saki@demo.hazai.test', 'email_verified', true), 'email', now(), now(), now());
update public.profiles set avatar_url = 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=75&auto=format&fit=crop', bio = 'ステンドグラスと吹きガラスの作家です。' where id = 'd0000001-0000-4000-8000-000000000002';

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('00000000-0000-0000-0000-000000000000', 'd0000001-0000-4000-8000-000000000003', 'authenticated', 'authenticated', 'kenta@demo.hazai.test', extensions.crypt('hazai-demo', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', jsonb_build_object('display_name', '山本 けんた', 'location', '長野県', 'genre', '木工'), now(), now(), '', '', '', '');
insert into auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (gen_random_uuid(), 'd0000001-0000-4000-8000-000000000003', 'd0000001-0000-4000-8000-000000000003', jsonb_build_object('sub', 'd0000001-0000-4000-8000-000000000003', 'email', 'kenta@demo.hazai.test', 'email_verified', true), 'email', now(), now(), now());
update public.profiles set avatar_url = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=75&auto=format&fit=crop', bio = '家具工房で働きながら小物をつくっています。' where id = 'd0000001-0000-4000-8000-000000000003';

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('00000000-0000-0000-0000-000000000000', 'd0000001-0000-4000-8000-000000000004', 'authenticated', 'authenticated', 'yuto@demo.hazai.test', extensions.crypt('hazai-demo', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', jsonb_build_object('display_name', '中村 ゆうと', 'location', '大阪府', 'genre', '金属・アクセサリー'), now(), now(), '', '', '', '');
insert into auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (gen_random_uuid(), 'd0000001-0000-4000-8000-000000000004', 'd0000001-0000-4000-8000-000000000004', jsonb_build_object('sub', 'd0000001-0000-4000-8000-000000000004', 'email', 'yuto@demo.hazai.test', 'email_verified', true), 'email', now(), now(), now());
update public.profiles set avatar_url = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=75&auto=format&fit=crop', bio = '真鍮とシルバーでアクセサリーを制作。' where id = 'd0000001-0000-4000-8000-000000000004';

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('00000000-0000-0000-0000-000000000000', 'd0000001-0000-4000-8000-000000000005', 'authenticated', 'authenticated', 'aya@demo.hazai.test', extensions.crypt('hazai-demo', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', jsonb_build_object('display_name', '小林 あや', 'location', '福岡県', 'genre', 'テキスタイル'), now(), now(), '', '', '', '');
insert into auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (gen_random_uuid(), 'd0000001-0000-4000-8000-000000000005', 'd0000001-0000-4000-8000-000000000005', jsonb_build_object('sub', 'd0000001-0000-4000-8000-000000000005', 'email', 'aya@demo.hazai.test', 'email_verified', true), 'email', now(), now(), now());
update public.profiles set avatar_url = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=75&auto=format&fit=crop', bio = 'リネンや古布を使った布小物をつくっています。' where id = 'd0000001-0000-4000-8000-000000000005';

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('00000000-0000-0000-0000-000000000000', 'd0000001-0000-4000-8000-000000000006', 'authenticated', 'authenticated', 'hana@demo.hazai.test', extensions.crypt('hazai-demo', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', jsonb_build_object('display_name', '伊藤 はな', 'location', '神奈川県', 'genre', 'ペーパークラフト'), now(), now(), '', '', '', '');
insert into auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (gen_random_uuid(), 'd0000001-0000-4000-8000-000000000006', 'd0000001-0000-4000-8000-000000000006', jsonb_build_object('sub', 'd0000001-0000-4000-8000-000000000006', 'email', 'hana@demo.hazai.test', 'email_verified', true), 'email', now(), now(), now());
update public.profiles set avatar_url = 'https://images.unsplash.com/photo-1575936123452-b67c3203c357?w=200&q=75&auto=format&fit=crop', bio = '紙と色のコラージュ作品を制作しています。' where id = 'd0000001-0000-4000-8000-000000000006';

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('00000000-0000-0000-0000-000000000000', 'd0000001-0000-4000-8000-000000000007', 'authenticated', 'authenticated', 'sou@demo.hazai.test', extensions.crypt('hazai-demo', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', jsonb_build_object('display_name', '渡辺 そう', 'location', '北海道', 'genre', 'レザークラフト'), now(), now(), '', '', '', '');
insert into auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (gen_random_uuid(), 'd0000001-0000-4000-8000-000000000007', 'd0000001-0000-4000-8000-000000000007', jsonb_build_object('sub', 'd0000001-0000-4000-8000-000000000007', 'email', 'sou@demo.hazai.test', 'email_verified', true), 'email', now(), now(), now());
update public.profiles set avatar_url = 'https://images.unsplash.com/photo-1611095973763-414019e72400?w=200&q=75&auto=format&fit=crop', bio = 'ヌメ革の財布や小物を手縫いでつくっています。' where id = 'd0000001-0000-4000-8000-000000000007';

insert into public.follows (follower_id, followee_id) values
  ('d0000001-0000-4000-8000-000000000001', 'd0000001-0000-4000-8000-000000000002'),
  ('d0000001-0000-4000-8000-000000000001', 'd0000001-0000-4000-8000-000000000003'),
  ('d0000001-0000-4000-8000-000000000001', 'd0000001-0000-4000-8000-000000000004'),
  ('d0000001-0000-4000-8000-000000000001', 'd0000001-0000-4000-8000-000000000005'),
  ('d0000001-0000-4000-8000-000000000001', 'd0000001-0000-4000-8000-000000000006'),
  ('d0000001-0000-4000-8000-000000000001', 'd0000001-0000-4000-8000-000000000007'),
  ('d0000001-0000-4000-8000-000000000002', 'd0000001-0000-4000-8000-000000000001'),
  ('d0000001-0000-4000-8000-000000000002', 'd0000001-0000-4000-8000-000000000005'),
  ('d0000001-0000-4000-8000-000000000002', 'd0000001-0000-4000-8000-000000000006'),
  ('d0000001-0000-4000-8000-000000000003', 'd0000001-0000-4000-8000-000000000001'),
  ('d0000001-0000-4000-8000-000000000003', 'd0000001-0000-4000-8000-000000000007'),
  ('d0000001-0000-4000-8000-000000000004', 'd0000001-0000-4000-8000-000000000001'),
  ('d0000001-0000-4000-8000-000000000004', 'd0000001-0000-4000-8000-000000000002'),
  ('d0000001-0000-4000-8000-000000000005', 'd0000001-0000-4000-8000-000000000001'),
  ('d0000001-0000-4000-8000-000000000005', 'd0000001-0000-4000-8000-000000000002'),
  ('d0000001-0000-4000-8000-000000000005', 'd0000001-0000-4000-8000-000000000006'),
  ('d0000001-0000-4000-8000-000000000006', 'd0000001-0000-4000-8000-000000000005'),
  ('d0000001-0000-4000-8000-000000000006', 'd0000001-0000-4000-8000-000000000002'),
  ('d0000001-0000-4000-8000-000000000007', 'd0000001-0000-4000-8000-000000000003'),
  ('d0000001-0000-4000-8000-000000000007', 'd0000001-0000-4000-8000-000000000001');

-- 画像は外部 URL をそのまま storage_path に入れる（アプリは http で始まるパスを URL として扱う）
insert into public.listings (id, seller_id, title, description, price, category, size, weight, condition, shipping_methods, favorite_count, created_at, updated_at)
values ('d0000002-0000-4000-8000-000000000001', 'd0000001-0000-4000-8000-000000000003', '杉の端材セット', '棚の制作で出た杉材の端材です。長さはばらばらですが、小物づくりや試し削りにちょうど良いサイズです。', 1200, 'wood', '約 5〜30cm × 9cm × 2cm（15本前後）', '約 2.5kg', 'good', array['delivery']::text[], 42, '2026-09-18T01:00:00.000Z', '2026-09-18T01:00:00.000Z');
insert into public.listing_images (listing_id, storage_path, sort_order) values ('d0000002-0000-4000-8000-000000000001', 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&q=75&auto=format&fit=crop', 0);
insert into public.listing_images (listing_id, storage_path, sort_order) values ('d0000002-0000-4000-8000-000000000001', 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=75&auto=format&fit=crop', 1);
insert into public.listings (id, seller_id, title, description, price, category, size, weight, condition, shipping_methods, favorite_count, created_at, updated_at)
values ('d0000002-0000-4000-8000-000000000002', 'd0000001-0000-4000-8000-000000000001', 'ウォールナット無垢材 端材', 'キャビネット制作の残りです。木目がきれいな部分を選んでいます。', 2800, 'wood', '30cm × 12cm × 2cm（4枚）', '約 1.8kg', 'likeNew', array['delivery']::text[], 67, '2026-09-20T05:30:00.000Z', '2026-09-20T05:30:00.000Z');
insert into public.listing_images (listing_id, storage_path, sort_order) values ('d0000002-0000-4000-8000-000000000002', 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=800&q=75&auto=format&fit=crop', 0);
insert into public.listings (id, seller_id, title, description, price, category, size, weight, condition, shipping_methods, favorite_count, created_at, updated_at)
values ('d0000002-0000-4000-8000-000000000003', 'd0000001-0000-4000-8000-000000000003', 'ヒノキ角材 小割り', '香りの良いヒノキの小割り材です。模型や小箱の制作に。', 800, 'wood', '20cm × 3cm × 3cm（10本）', '約 0.8kg', 'good', array['delivery', 'post']::text[], 18, '2026-09-15T00:00:00.000Z', '2026-09-15T00:00:00.000Z');
insert into public.listing_images (listing_id, storage_path, sort_order) values ('d0000002-0000-4000-8000-000000000003', 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=75&auto=format&fit=crop', 0);
insert into public.listings (id, seller_id, title, description, price, category, size, weight, condition, shipping_methods, favorite_count, created_at, updated_at)
values ('d0000002-0000-4000-8000-000000000004', 'd0000001-0000-4000-8000-000000000002', 'ステンドグラス用 色ガラス片', 'ステンドグラス制作で余った色ガラスです。緑・琥珀・透明が中心です。エッジは処理していないので取り扱いにご注意ください。', 1500, 'glass', '3〜10cm 角（約 30 片）', '約 1.2kg', 'good', array['delivery']::text[], 55, '2026-09-19T07:00:00.000Z', '2026-09-19T07:00:00.000Z');
insert into public.listing_images (listing_id, storage_path, sort_order) values ('d0000002-0000-4000-8000-000000000004', 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=800&q=75&auto=format&fit=crop', 0);
insert into public.listings (id, seller_id, title, description, price, category, size, weight, condition, shipping_methods, favorite_count, created_at, updated_at)
values ('d0000002-0000-4000-8000-000000000005', 'd0000001-0000-4000-8000-000000000002', '小さなガラス瓶 5本', '一輪挿しやアロマボトルに使える小瓶です。', 900, 'glass', '高さ 8〜12cm', '約 0.6kg', 'likeNew', array['delivery']::text[], 23, '2026-09-12T02:00:00.000Z', '2026-09-12T02:00:00.000Z');
insert into public.listing_images (listing_id, storage_path, sort_order) values ('d0000002-0000-4000-8000-000000000005', 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=75&auto=format&fit=crop', 0);
insert into public.listings (id, seller_id, title, description, price, category, size, weight, condition, shipping_methods, favorite_count, created_at, updated_at)
values ('d0000002-0000-4000-8000-000000000006', 'd0000001-0000-4000-8000-000000000005', 'リネン生地 はぎれ', '生成りのリネンのはぎれです。コースターや巾着に。', 600, 'fabric', '50cm × 40cm（3枚）', '約 0.2kg', 'new', array['post']::text[], 31, '2026-09-20T23:00:00.000Z', '2026-09-20T23:00:00.000Z');
insert into public.listing_images (listing_id, storage_path, sort_order) values ('d0000002-0000-4000-8000-000000000006', 'https://images.unsplash.com/photo-1528458909336-e7a0adfed0a5?w=800&q=75&auto=format&fit=crop', 0);
insert into public.listings (id, seller_id, title, description, price, category, size, weight, condition, shipping_methods, favorite_count, created_at, updated_at)
values ('d0000002-0000-4000-8000-000000000007', 'd0000001-0000-4000-8000-000000000005', '黒フェルト 端切れ', '厚手 3mm のフェルトです。', 400, 'fabric', '30cm × 30cm（2枚）', '約 0.1kg', 'new', array['post']::text[], 9, '2026-09-10T04:00:00.000Z', '2026-09-10T04:00:00.000Z');
insert into public.listing_images (listing_id, storage_path, sort_order) values ('d0000002-0000-4000-8000-000000000007', 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=800&q=75&auto=format&fit=crop', 0);
insert into public.listings (id, seller_id, title, description, price, category, size, weight, condition, shipping_methods, favorite_count, created_at, updated_at)
values ('d0000002-0000-4000-8000-000000000008', 'd0000001-0000-4000-8000-000000000005', 'コットン裏毛 はぎれ', 'スウェット制作の残りです。白のコットン裏毛。', 500, 'fabric', '60cm × 45cm', '約 0.2kg', 'likeNew', array['post']::text[], 12, '2026-09-08T01:00:00.000Z', '2026-09-08T01:00:00.000Z');
insert into public.listing_images (listing_id, storage_path, sort_order) values ('d0000002-0000-4000-8000-000000000008', 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=75&auto=format&fit=crop', 0);
insert into public.listings (id, seller_id, title, description, price, category, size, weight, condition, shipping_methods, favorite_count, created_at, updated_at)
values ('d0000002-0000-4000-8000-000000000009', 'd0000001-0000-4000-8000-000000000004', 'カラーアクリル板 端材', 'レーザーカットで余ったアクリル板です。色はおまかせになります。', 1000, 'acrylic', '5〜15cm 角、厚さ 3mm（約 20 枚）', '約 0.9kg', 'good', array['delivery', 'post']::text[], 38, '2026-09-17T06:00:00.000Z', '2026-09-17T06:00:00.000Z');
insert into public.listing_images (listing_id, storage_path, sort_order) values ('d0000002-0000-4000-8000-000000000009', 'https://images.unsplash.com/photo-1509343256512-d77a5cb3791b?w=800&q=75&auto=format&fit=crop', 0);
insert into public.listings (id, seller_id, title, description, price, category, size, weight, condition, shipping_methods, favorite_count, created_at, updated_at)
values ('d0000002-0000-4000-8000-000000000010', 'd0000001-0000-4000-8000-000000000004', 'グラデーションアクリル板', '偏光グラデーションのアクリル板です。', 1400, 'acrylic', '20cm × 20cm × 2mm（3枚）', '約 0.3kg', 'new', array['post']::text[], 27, '2026-09-14T03:00:00.000Z', '2026-09-14T03:00:00.000Z');
insert into public.listing_images (listing_id, storage_path, sort_order) values ('d0000002-0000-4000-8000-000000000010', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=75&auto=format&fit=crop', 0);
insert into public.listings (id, seller_id, title, description, price, category, size, weight, condition, shipping_methods, favorite_count, created_at, updated_at)
values ('d0000002-0000-4000-8000-000000000011', 'd0000001-0000-4000-8000-000000000007', 'ヌメ革 ハギレ', '財布制作の残りのヌメ革です。キーホルダーやカードケースに。', 1800, 'leather', '10〜25cm（約 10 枚）', '約 0.5kg', 'good', array['delivery', 'post']::text[], 49, '2026-09-22T01:00:00.000Z', '2026-09-22T01:00:00.000Z');
insert into public.listing_images (listing_id, storage_path, sort_order) values ('d0000002-0000-4000-8000-000000000011', 'https://images.unsplash.com/photo-1473188588951-666fce8e7c68?w=800&q=75&auto=format&fit=crop', 0);
insert into public.listings (id, seller_id, title, description, price, category, size, weight, condition, shipping_methods, favorite_count, created_at, updated_at)
values ('d0000002-0000-4000-8000-000000000012', 'd0000001-0000-4000-8000-000000000007', 'レザー端切れ ブラック', 'バッグ制作で出た牛革の端切れです。', 1300, 'leather', '10〜20cm（約 8 枚）', '約 0.4kg', 'fair', array['post']::text[], 14, '2026-09-11T08:00:00.000Z', '2026-09-11T08:00:00.000Z');
insert into public.listing_images (listing_id, storage_path, sort_order) values ('d0000002-0000-4000-8000-000000000012', 'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800&q=75&auto=format&fit=crop', 0);
insert into public.listings (id, seller_id, title, description, price, category, size, weight, condition, shipping_methods, favorite_count, created_at, updated_at)
values ('d0000002-0000-4000-8000-000000000013', 'd0000001-0000-4000-8000-000000000004', '真鍮・ステンレス端材', 'アクセサリー制作で余った真鍮板とステンレス線のセットです。', 2000, 'metal', '板 5cm 角前後、線 φ1mm', '約 0.7kg', 'good', array['delivery']::text[], 33, '2026-09-16T00:30:00.000Z', '2026-09-16T00:30:00.000Z');
insert into public.listing_images (listing_id, storage_path, sort_order) values ('d0000002-0000-4000-8000-000000000013', 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=75&auto=format&fit=crop', 0);
insert into public.listings (id, seller_id, title, description, price, category, size, weight, condition, shipping_methods, favorite_count, created_at, updated_at)
values ('d0000002-0000-4000-8000-000000000014', 'd0000001-0000-4000-8000-000000000004', 'ステンレスパイプ 切れ端', '什器制作の残りのステンレスパイプです。', 1600, 'metal', '長さ 20〜40cm、φ19mm（6本）', '約 2.2kg', 'fair', array['delivery']::text[], 7, '2026-09-05T05:00:00.000Z', '2026-09-05T05:00:00.000Z');
insert into public.listing_images (listing_id, storage_path, sort_order) values ('d0000002-0000-4000-8000-000000000014', 'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=800&q=75&auto=format&fit=crop', 0);
insert into public.listings (id, seller_id, title, description, price, category, size, weight, condition, shipping_methods, favorite_count, created_at, updated_at)
values ('d0000002-0000-4000-8000-000000000015', 'd0000001-0000-4000-8000-000000000006', '和紙 端紙セット', '手漉き和紙の端紙です。ちぎり絵や封筒づくりに。', 500, 'paper', 'A5〜A4 程度（約 20 枚）', '約 0.1kg', 'good', array['post']::text[], 21, '2026-09-13T01:00:00.000Z', '2026-09-13T01:00:00.000Z');
insert into public.listing_images (listing_id, storage_path, sort_order) values ('d0000002-0000-4000-8000-000000000015', 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800&q=75&auto=format&fit=crop', 0);
insert into public.listings (id, seller_id, title, description, price, category, size, weight, condition, shipping_methods, favorite_count, created_at, updated_at)
values ('d0000002-0000-4000-8000-000000000016', 'd0000001-0000-4000-8000-000000000006', '画用紙 あまり', '白の画用紙です。少し角折れがあります。', 300, 'paper', 'B4（15 枚）', '約 0.3kg', 'fair', array['post']::text[], 5, '2026-09-09T10:00:00.000Z', '2026-09-09T10:00:00.000Z');
insert into public.listing_images (listing_id, storage_path, sort_order) values ('d0000002-0000-4000-8000-000000000016', 'https://images.unsplash.com/photo-1601662528567-526cd06f6582?w=800&q=75&auto=format&fit=crop', 0);
insert into public.listings (id, seller_id, title, description, price, category, size, weight, condition, shipping_methods, favorite_count, created_at, updated_at)
values ('d0000002-0000-4000-8000-000000000017', 'd0000001-0000-4000-8000-000000000003', 'クラフト道具とパーツの詰め合わせ', '釘・ビス・金具など、工房整理で出たパーツ類です。', 2500, 'other', '箱 30cm × 20cm × 10cm', '約 1.5kg', 'good', array['delivery']::text[], 16, '2026-09-07T02:00:00.000Z', '2026-09-07T02:00:00.000Z');
insert into public.listing_images (listing_id, storage_path, sort_order) values ('d0000002-0000-4000-8000-000000000017', 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=800&q=75&auto=format&fit=crop', 0);

insert into public.gallery_posts (id, author_id, title, description, category, created_at, updated_at)
values ('d0000003-0000-4000-8000-000000000001', 'd0000001-0000-4000-8000-000000000003', '杉の端材でつくったスツール', '棚の制作で余った杉材を集めて、小さなスツールにしました。脚の角度を何度も試して、ようやく安定する形に。', 'wood', '2026-09-22T11:00:00.000Z', '2026-09-22T11:00:00.000Z');
insert into public.gallery_images (gallery_post_id, storage_path, sort_order) values ('d0000003-0000-4000-8000-000000000001', 'https://images.unsplash.com/photo-1503602642458-232111445657?w=1000&q=75&auto=format&fit=crop', 0);
insert into public.gallery_images (gallery_post_id, storage_path, sort_order) values ('d0000003-0000-4000-8000-000000000001', 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=1000&q=75&auto=format&fit=crop', 1);
insert into public.gallery_images (gallery_post_id, storage_path, sort_order) values ('d0000003-0000-4000-8000-000000000001', 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=1000&q=75&auto=format&fit=crop', 2);
insert into public.gallery_posts (id, author_id, title, description, category, created_at, updated_at)
values ('d0000003-0000-4000-8000-000000000002', 'd0000001-0000-4000-8000-000000000002', 'ガラス片の一輪挿し', 'ステンドグラスの残りを溶着して、一輪挿しをつくりました。光が当たると机に色が落ちるのが好きです。', 'glass', '2026-09-21T09:00:00.000Z', '2026-09-21T09:00:00.000Z');
insert into public.gallery_images (gallery_post_id, storage_path, sort_order) values ('d0000003-0000-4000-8000-000000000002', 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=1000&q=75&auto=format&fit=crop', 0);
insert into public.gallery_images (gallery_post_id, storage_path, sort_order) values ('d0000003-0000-4000-8000-000000000002', 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1000&q=75&auto=format&fit=crop', 1);
insert into public.gallery_posts (id, author_id, title, description, category, created_at, updated_at)
values ('d0000003-0000-4000-8000-000000000003', 'd0000001-0000-4000-8000-000000000001', 'ウォールナットのサイドテーブル', 'キャビネットの端材を天板に。脚はナラの残り材です。', 'wood', '2026-09-20T03:00:00.000Z', '2026-09-20T03:00:00.000Z');
insert into public.gallery_images (gallery_post_id, storage_path, sort_order) values ('d0000003-0000-4000-8000-000000000003', 'https://images.unsplash.com/photo-1611486212557-88be5ff6f941?w=1000&q=75&auto=format&fit=crop', 0);
insert into public.gallery_posts (id, author_id, title, description, category, created_at, updated_at)
values ('d0000003-0000-4000-8000-000000000004', 'd0000001-0000-4000-8000-000000000006', 'アクリル絵具のフルイドアート', '余った絵具を混ぜて流したら、思いがけない模様に。', 'acrylic', '2026-09-19T12:00:00.000Z', '2026-09-19T12:00:00.000Z');
insert into public.gallery_images (gallery_post_id, storage_path, sort_order) values ('d0000003-0000-4000-8000-000000000004', 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=1000&q=75&auto=format&fit=crop', 0);
insert into public.gallery_posts (id, author_id, title, description, category, created_at, updated_at)
values ('d0000003-0000-4000-8000-000000000005', 'd0000001-0000-4000-8000-000000000007', 'ヌメ革のショルダーバッグ', 'ハギレをパッチワークして、ひとつのバッグに仕立てました。', 'leather', '2026-09-18T01:00:00.000Z', '2026-09-18T01:00:00.000Z');
insert into public.gallery_images (gallery_post_id, storage_path, sort_order) values ('d0000003-0000-4000-8000-000000000005', 'https://images.unsplash.com/photo-1473188588951-666fce8e7c68?w=1000&q=75&auto=format&fit=crop', 0);
insert into public.gallery_images (gallery_post_id, storage_path, sort_order) values ('d0000003-0000-4000-8000-000000000005', 'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=1000&q=75&auto=format&fit=crop', 1);
insert into public.gallery_posts (id, author_id, title, description, category, created_at, updated_at)
values ('d0000003-0000-4000-8000-000000000006', 'd0000001-0000-4000-8000-000000000001', '端材の椅子、もう一脚', '工房に残っていたナラ材で。背もたれのカーブを削り出すのに三日かかりました。', 'wood', '2026-09-16T06:00:00.000Z', '2026-09-16T06:00:00.000Z');
insert into public.gallery_images (gallery_post_id, storage_path, sort_order) values ('d0000003-0000-4000-8000-000000000006', 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=1000&q=75&auto=format&fit=crop', 0);
insert into public.gallery_posts (id, author_id, title, description, category, created_at, updated_at)
values ('d0000003-0000-4000-8000-000000000007', 'd0000001-0000-4000-8000-000000000006', '紙の切れ端でつくるウォールアート', '色紙の残りを額に入れて並べました。', 'paper', '2026-09-14T00:00:00.000Z', '2026-09-14T00:00:00.000Z');
insert into public.gallery_images (gallery_post_id, storage_path, sort_order) values ('d0000003-0000-4000-8000-000000000007', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1000&q=75&auto=format&fit=crop', 0);
insert into public.gallery_posts (id, author_id, title, description, category, created_at, updated_at)
values ('d0000003-0000-4000-8000-000000000008', 'd0000001-0000-4000-8000-000000000005', 'はぎれのピローカバー', 'リネンのはぎれをつないでピローカバーに。', 'fabric', '2026-09-12T04:00:00.000Z', '2026-09-12T04:00:00.000Z');
insert into public.gallery_images (gallery_post_id, storage_path, sort_order) values ('d0000003-0000-4000-8000-000000000008', 'https://images.unsplash.com/photo-1616627561839-074385245ff6?w=1000&q=75&auto=format&fit=crop', 0);
insert into public.gallery_images (gallery_post_id, storage_path, sort_order) values ('d0000003-0000-4000-8000-000000000008', 'https://images.unsplash.com/photo-1528458909336-e7a0adfed0a5?w=1000&q=75&auto=format&fit=crop', 1);
insert into public.gallery_images (gallery_post_id, storage_path, sort_order) values ('d0000003-0000-4000-8000-000000000008', 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=1000&q=75&auto=format&fit=crop', 2);
insert into public.gallery_posts (id, author_id, title, description, category, created_at, updated_at)
values ('d0000003-0000-4000-8000-000000000009', 'd0000001-0000-4000-8000-000000000004', 'アクリル絵具の厚塗り', 'パレットに残った色だけで一枚描いてみました。', 'acrylic', '2026-09-10T08:00:00.000Z', '2026-09-10T08:00:00.000Z');
insert into public.gallery_images (gallery_post_id, storage_path, sort_order) values ('d0000003-0000-4000-8000-000000000009', 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?w=1000&q=75&auto=format&fit=crop', 0);
insert into public.gallery_posts (id, author_id, title, description, category, created_at, updated_at)
values ('d0000003-0000-4000-8000-000000000010', 'd0000001-0000-4000-8000-000000000001', '端材の器', '小さな器をつくりました。釉薬の残りで色づけしています。', 'other', '2026-09-08T02:00:00.000Z', '2026-09-08T02:00:00.000Z');
insert into public.gallery_images (gallery_post_id, storage_path, sort_order) values ('d0000003-0000-4000-8000-000000000010', 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=1000&q=75&auto=format&fit=crop', 0);

insert into public.conversations (id, listing_id, created_at, updated_at) values ('d0000004-0000-4000-8000-000000000001', 'd0000002-0000-4000-8000-000000000002', '2026-09-21T01:10:00.000Z', '2026-09-21T01:10:00.000Z');
insert into public.conversation_members (conversation_id, user_id) values ('d0000004-0000-4000-8000-000000000001', 'd0000001-0000-4000-8000-000000000002'), ('d0000004-0000-4000-8000-000000000001', 'd0000001-0000-4000-8000-000000000001');
insert into public.messages (conversation_id, sender_id, content, created_at) values ('d0000004-0000-4000-8000-000000000001', 'd0000001-0000-4000-8000-000000000002', 'はじめまして。ウォールナットの端材、まだありますか？ 小さなトレイをつくりたいと思っています。', '2026-09-21T01:10:00.000Z');
insert into public.messages (conversation_id, sender_id, content, created_at) values ('d0000004-0000-4000-8000-000000000001', 'd0000001-0000-4000-8000-000000000001', 'ありがとうございます！まだあります。4枚セットでのお渡しになりますが大丈夫でしょうか？', '2026-09-21T02:05:00.000Z');
insert into public.messages (conversation_id, sender_id, content, created_at) values ('d0000004-0000-4000-8000-000000000001', 'd0000001-0000-4000-8000-000000000002', '大丈夫です。ぜひ購入させてください。', '2026-09-21T02:20:00.000Z');
insert into public.conversations (id, listing_id, created_at, updated_at) values ('d0000004-0000-4000-8000-000000000002', 'd0000002-0000-4000-8000-000000000001', '2026-09-19T09:00:00.000Z', '2026-09-19T09:00:00.000Z');
insert into public.conversation_members (conversation_id, user_id) values ('d0000004-0000-4000-8000-000000000002', 'd0000001-0000-4000-8000-000000000001'), ('d0000004-0000-4000-8000-000000000002', 'd0000001-0000-4000-8000-000000000003');
insert into public.messages (conversation_id, sender_id, content, created_at) values ('d0000004-0000-4000-8000-000000000002', 'd0000001-0000-4000-8000-000000000001', '杉の端材セット、スツールの座面に使えそうな幅のものはありますか？', '2026-09-19T09:00:00.000Z');
insert into public.messages (conversation_id, sender_id, content, created_at) values ('d0000004-0000-4000-8000-000000000002', 'd0000001-0000-4000-8000-000000000003', '幅9cmのものが中心ですが、2枚はぎにすれば座面にできますよ。', '2026-09-19T10:30:00.000Z');

-- いいねとコメント（件数はトリガーで gallery_posts.like_count / comment_count に反映される）
insert into public.gallery_likes (user_id, gallery_post_id) values
  ('d0000001-0000-4000-8000-000000000002', 'd0000003-0000-4000-8000-000000000003'), ('d0000001-0000-4000-8000-000000000003', 'd0000003-0000-4000-8000-000000000003'), ('d0000001-0000-4000-8000-000000000005', 'd0000003-0000-4000-8000-000000000003'),
  ('d0000001-0000-4000-8000-000000000002', 'd0000003-0000-4000-8000-000000000006'), ('d0000001-0000-4000-8000-000000000004', 'd0000003-0000-4000-8000-000000000006'),
  ('d0000001-0000-4000-8000-000000000001', 'd0000003-0000-4000-8000-000000000001'), ('d0000001-0000-4000-8000-000000000002', 'd0000003-0000-4000-8000-000000000001'), ('d0000001-0000-4000-8000-000000000005', 'd0000003-0000-4000-8000-000000000001'),
  ('d0000001-0000-4000-8000-000000000001', 'd0000003-0000-4000-8000-000000000002'), ('d0000001-0000-4000-8000-000000000005', 'd0000003-0000-4000-8000-000000000002'), ('d0000001-0000-4000-8000-000000000006', 'd0000003-0000-4000-8000-000000000002'),
  ('d0000001-0000-4000-8000-000000000001', 'd0000003-0000-4000-8000-000000000005'), ('d0000001-0000-4000-8000-000000000003', 'd0000003-0000-4000-8000-000000000005');

insert into public.gallery_comments (gallery_post_id, author_id, content, created_at) values
  ('d0000003-0000-4000-8000-000000000003', 'd0000001-0000-4000-8000-000000000002', '木目がきれいですね！天板の厚みはどれくらいですか？', '2026-09-20T05:00:00.000Z'),
  ('d0000003-0000-4000-8000-000000000003', 'd0000001-0000-4000-8000-000000000001', 'ありがとうございます。2cm です。', '2026-09-20T06:10:00.000Z'),
  ('d0000003-0000-4000-8000-000000000001', 'd0000001-0000-4000-8000-000000000001', '脚の角度、参考にさせてください。', '2026-09-22T12:30:00.000Z'),
  ('d0000003-0000-4000-8000-000000000002', 'd0000001-0000-4000-8000-000000000005', '光の入り方がすてきです。', '2026-09-21T10:00:00.000Z');
