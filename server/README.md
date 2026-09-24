# はざい箱 開発用サーバー

Supabase へ移行するまでの間、アカウント・商品・ギャラリー・メッセージを扱うローカル API サーバー。
Node.js 24 の組み込み SQLite (`node:sqlite`) を使うため、ネイティブモジュールのビルドは不要。

## 起動

```sh
# リポジトリ直下から
npm run server:install   # 初回のみ
npm run server           # http://localhost:8787 （ファイル変更で自動再起動）
```

アプリ (`npx expo start`) とは別のターミナルで起動しておく。
初回起動時、データベースが空ならデモデータを自動で投入する。

データを初期状態に戻す：

```sh
npm run server:seed      # 全データを削除してデモデータを入れ直す
```

データは `server/data/`（Git 管理外）に保存される。

## デモアカウント

パスワードはすべて `hazai-demo`。開発ビルドではログイン画面からワンタップで切り替えられる。

| 名前 | メールアドレス |
| --- | --- |
| 佐藤 みお | mio@demo.hazai.test |
| 高橋 さき | saki@demo.hazai.test |
| 山本 けんた | kenta@demo.hazai.test |
| 中村 ゆうと | yuto@demo.hazai.test |
| 小林 あや | aya@demo.hazai.test |
| 伊藤 はな | hana@demo.hazai.test |
| 渡辺 そう | sou@demo.hazai.test |

## API

認証が必要なものは `Authorization: Bearer <token>` を付ける。

| メソッド | パス | 認証 | 内容 |
| --- | --- | --- | --- |
| POST | `/auth/register` | | 登録してトークンを発行 |
| POST | `/auth/login` | | ログインしてトークンを発行 |
| POST | `/auth/logout` | 要 | セッションを破棄 |
| GET / PATCH | `/me` | 要 | 自分のアカウント取得・プロフィール更新 |
| GET | `/me/following` | 要 | フォロー中のユーザー |
| GET | `/me/favorite-product-ids` | 要 | お気に入りに追加した商品の ID（新しい順） |
| GET | `/users/:id` | | プロフィール |
| GET | `/products` | | 一覧（`category` `q` `sellerId` `sort=newest\|popular` `limit`） |
| GET | `/products/:id` | | 詳細 |
| POST | `/products` | 要 | 出品（画像は先に `/uploads` へ送る） |
| POST / DELETE | `/products/:id/favorite` | 要 | お気に入りの追加・解除（自分の商品は追加不可） |
| GET | `/gallery-posts` | | 一覧（`category` `authorId`） |
| POST | `/gallery-posts` | 要 | 作品の投稿（画像は先に `/uploads` へ送る。1〜4枚） |
| GET / POST | `/conversations` | 要 | 会話一覧・会話の開始（同じ相手と商品なら既存を返す） |
| GET | `/conversations/:id` | 要 | 会話の詳細（参加者のみ） |
| GET / POST | `/conversations/:id/messages` | 要 | メッセージ取得・送信（参加者のみ） |
| POST | `/uploads` | 要 | 画像アップロード（base64、JPEG / PNG / WebP、8MB まで） |
| GET | `/ws` | | WebSocket。接続後に `{"type":"auth","token":"..."}` を送ると新着メッセージが届く |
| GET | `/dev/demo-accounts` | | 開発時のみ。デモアカウント一覧 |

## Supabase へ移行するときの対応

- テーブル構成は `src/db/schema.ts`。PostgreSQL にほぼそのまま移せる（JSON 文字列の列は `text[]` / `jsonb` へ）
- 認可はサーバーのコードで行っている（会話の参加者チェック、出品者 ID はセッションから決定など）。移行時は同じ条件を RLS ポリシーで表現する
- アプリ側で差し替えるのは `src/features/*/api.ts` と `src/features/messages/realtime.ts`、`src/features/auth/AuthProvider.tsx`

## 環境変数

| 変数 | 既定値 | 内容 |
| --- | --- | --- |
| `PORT` | `8787` | 待ち受けポート |
| `DATA_DIR` | `server/data` | DB とアップロード画像の保存先 |
| `CORS_ORIGINS` | なし | 追加で許可するオリジン（カンマ区切り）。開発時は localhost と LAN（192.168.x.x など）を許可済み |
| `NODE_ENV` | | `production` のときはデモデータ投入と `/dev` を無効化 |
