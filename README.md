# はざい箱

端材の売買と、端材から生まれた作品の共有を組み合わせた、クリエイター向けフリマ SNS です。

```text
ユーザー → Web アプリ（Expo / React Native Web）→ Vercel（静的配信）→ Supabase
                                                              ├─ Auth（メール + パスワード）
                                                              ├─ PostgreSQL（RLS で権限制御）
                                                              ├─ Storage（画像）
                                                              └─ Realtime（チャット）
```

初めてセットアップする場合は **[MANUAL_SETUP.md](MANUAL_SETUP.md)** の手順に沿って進めてください。

## 技術構成

| 領域         | 使用技術                                                   |
| ------------ | ---------------------------------------------------------- |
| アプリ       | Expo SDK 57 / React Native 0.86 / expo-router / TypeScript |
| データ取得   | @supabase/supabase-js + TanStack Query                     |
| バックエンド | Supabase（Auth / PostgreSQL / Storage / Realtime）         |
| 公開         | Vercel（`expo export --platform web` の静的出力を配信）    |
| DB テスト    | PGlite（WASM 版 PostgreSQL）+ node:test                    |

## ディレクトリ構成

```text
src/
  app/                 画面（expo-router のルート）
  components/          共通 UI
  features/<機能>/     機能ごとの UI・フック・api.ts（Supabase へのアクセスはここに集約）
  api/                 mappers.ts（DB の行 → 画面用の型）・errors.ts・queryKeys.ts
  lib/supabase/        Supabase クライアント・DB 型定義・Storage ヘルパー
  types/models.ts      画面が使うドメイン型
supabase/
  migrations/          テーブル・制約・トリガー・関数・RLS・Storage・Realtime の SQL
  seed.sql             ローカル開発用のデモデータ
  tests/               マイグレーションと RLS の自動テスト
  config.toml          Supabase CLI（ローカル開発）の設定
```

画面は Supabase のテーブル構造に直接依存せず、`src/features/*/api.ts` → `src/api/mappers.ts` でドメイン型（`src/types/models.ts`）へ変換してから使います。

## ローカルで動かす

```sh
npm install
cp .env.example .env      # 値を入れる（MANUAL_SETUP.md の手順 2）
npx expo start --web      # http://localhost:8081
```

### コマンド

| コマンド                         | 内容                                                                                                |
| -------------------------------- | --------------------------------------------------------------------------------------------------- |
| `npm run web`                    | Web 版の開発サーバー                                                                                |
| `npm run typecheck`              | アプリと DB テストの型チェック                                                                      |
| `npm run lint`                   | ESLint                                                                                              |
| `npm run test:db`                | マイグレーションを PostgreSQL（PGlite）に適用し、RLS・トリガー・型定義の整合性を検証（Docker 不要） |
| `npx expo export --platform web` | 本番ビルド（`dist/` に出力。Vercel と同じ処理）                                                     |

## 環境変数

| 変数名                                 | 内容                                    | 公開してよいか                   |
| -------------------------------------- | --------------------------------------- | -------------------------------- |
| `EXPO_PUBLIC_SUPABASE_URL`             | Supabase の Project URL                 | はい                             |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key（`sb_publishable_...`） | はい（RLS で保護する前提のキー） |

- `EXPO_PUBLIC_` の値は**ビルド時にアプリへ埋め込まれ、ブラウザから見えます**。Secret key（`sb_secret_...`）や `service_role` key は絶対に設定しないでください。
- `.env` は `.gitignore` 済みです。コミットしないでください。
- 値を変えたら開発サーバーの再起動（本番は再デプロイ）が必要です。

## Vercel で公開する

リポジトリ直下の `vercel.json` にビルド設定があります（ビルドコマンド `npx expo export --platform web`、出力先 `dist`、全パスを `index.html` へ書き換えて SPA として配信）。

1. Vercel でこの GitHub リポジトリを Import する（Framework Preset は **Other**。ビルド設定は `vercel.json` が使われる）
2. **Vercel → Project → Settings → Environment Variables** に次を登録する（Production と Preview の両方）
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
3. Deploy する。以降は GitHub の `main` へ push すると自動でデプロイされる

環境変数はビルド時に埋め込まれるため、**変更した場合は Redeploy が必要**です。未設定のままデプロイすると、画面に「Supabase の接続設定がありません」と表示されます。

## Supabase の本番設定

**Supabase Dashboard → Authentication → URL Configuration**

| 項目          | 設定値の例                                                                                                                                                                                                                 |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Site URL      | `https://example.vercel.app`（Vercel の本番 URL）                                                                                                                                                                          |
| Redirect URLs | `https://example.vercel.app/**`<br>`http://localhost:8081/**`（ローカル開発）<br>`https://*-<Vercel のチーム名>.vercel.app/**`（プレビューデプロイも確認メールを使う場合）<br>`hazaibako://**`（将来のネイティブアプリ用） |

確認メールのリンクは `<Site URL のドメイン>/auth/callback` に戻ります（`emailRedirectTo` はアプリが実行中のオリジンから組み立てるため、そのオリジンが Redirect URLs に含まれている必要があります）。

**独自ドメインへ移行する場合**（例: `https://example.jp`）は、Vercel にドメインを追加したうえで、Site URL を `https://example.jp` に変更し、Redirect URLs に `https://example.jp/**` を追加してください。

## データベース

マイグレーション（`supabase/migrations/`）だけで再構築できます。Dashboard での手作業は不要です。

| ファイル                 | 内容                                                                          |
| ------------------------ | ----------------------------------------------------------------------------- |
| `..._initial_schema.sql` | テーブル・制約・インデックス・トリガー・RPC・GRANT                            |
| `..._rls_policies.sql`   | 全テーブルの Row Level Security                                               |
| `..._storage.sql`        | Storage バケット（`avatars` / `listing-images` / `gallery-images`）とポリシー |
| `..._realtime.sql`       | `messages` の Realtime 配信                                                   |

### テーブル

| テーブル                                              | 内容                                                                                   |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `profiles`                                            | `auth.users` と 1 対 1 のプロフィール。サインアップ時にトリガーで自動作成              |
| `follows`                                             | フォロー関係                                                                           |
| `listings` / `listing_images`                         | 端材の出品と画像（1 商品 6 枚まで）                                                    |
| `gallery_posts` / `gallery_images`                    | 作品投稿と画像（1 投稿 1〜4 枚）。出品とは独立。投稿者は削除できる                     |
| `gallery_likes` / `gallery_comments`                  | 作品へのいいね（本人のみ閲覧）とコメント（公開。削除はコメントした本人か作品の投稿者） |
| `favorites`                                           | お気に入り（ユーザー × 商品で一意）                                                    |
| `cart_items`                                          | カート（ユーザー × 商品で一意）                                                        |
| `conversations` / `conversation_members` / `messages` | 商品についての 1 対 1 チャット                                                         |

### セキュリティの方針

- すべてのテーブルで RLS を有効化し、`auth.uid()` で本人を判定しています。ブラウザから Supabase API を直接呼ばれても他人のデータは変更できません。
- 所有者の列（`seller_id` / `user_id` / `sender_id` など）は DB の既定値 `auth.uid()` で決まり、**クライアントから値を送る権限自体を与えていません**（列単位の GRANT）。なりすましはできません。
- お気に入り数（`listings.favorite_count`）、いいね数・コメント数（`gallery_posts.like_count` / `comment_count`）はトリガーでのみ更新され、出品者・投稿者も書き換えられません。
- 会話と参加者は `start_conversation()` でのみ作成でき、他人を勝手に会話へ追加できません。会話に参加していないユーザーはメッセージを取得・送信できません。
- Storage は `{user_id}/...` のフォルダに分け、本人のフォルダ以外へは書き込み・削除できません。
- 画像は公開 URL で配信します（バケットは public）。非公開にした商品の画像も、パスを知っていれば閲覧できる点に注意してください。

これらは `npm run test:db` で自動検証しています（他人の商品を編集できない、会話外のユーザーがメッセージを読めない、他人の Storage に書き込めない など）。

### DB 型定義

`src/lib/supabase/database.types.ts` はマイグレーションに対応する型定義です。スキーマを変更したら再生成してください。

```sh
npx supabase gen types typescript --linked --schema public > src/lib/supabase/database.types.ts
```

`npm run test:db` は、型定義のテーブル・列・外部キー・RPC が実際のスキーマと一致しているかも検証します。

## 未実装・今後の対応

- 決済・配送・本人確認（画面上は「準備中」表示）
- フォローボタン、コメントの編集
- パスワードリセット画面（`src/features/auth/api.ts` に `resetPasswordForEmail` を追加し、`/auth/callback` で `PASSWORD_RECOVERY` を扱う想定）
- 出品画像の差し替え（商品の編集は画像以外の項目のみ）
- ネイティブアプリでの確認メールからの復帰（ディープリンク処理）
