# 手動セットアップ手順

Claude Code から実行できない操作（アカウント作成・Dashboard の設定・デプロイなど）を、実施する順番にまとめています。
**✏️ の箇所は、あなたが値を入力・控える必要がある箇所です。**

所要時間の目安: 30〜45 分

---

## 1. Supabase プロジェクトを作成する

1. https://supabase.com/dashboard にログインし、**New project** を選ぶ
2. 次を入力して作成する
   - Name: 例）`hazai-bako`
   - ✏️ **Database Password**: 強いパスワードを生成し、**パスワードマネージャーなどに控える**（手順 3 で使う）
   - Region: `Northeast Asia (Tokyo)` を推奨
3. 作成完了まで数分待つ

✏️ **控えておく値**: Dashboard の URL `https://supabase.com/dashboard/project/<ここ>` の `<ここ>` が **Project ref** です（例: `abcdefghijklmnop`）。

## 2. 接続情報を取得し、ローカルの `.env` を作る

1. Dashboard 上部の **Connect**（または **Project Settings → API Keys**）を開く
2. 次の 2 つを控える
   - ✏️ **Project URL**（例: `https://abcdefghijklmnop.supabase.co`）
   - ✏️ **Publishable key**（`sb_publishable_` で始まる値）
3. リポジトリ直下で `.env.example` を `.env` にコピーし、値を書き換える

   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
   EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxx
   ```

> ⚠️ **Secret key（`sb_secret_...`）や `service_role` key は `.env` にも Vercel にも絶対に入れないでください。** アプリに埋め込まれ、誰でも全データを操作できる状態になります。
> `.env` は Git 管理対象外です（コミットしないこと）。

## 3. データベースを構築する（マイグレーションの適用）

リポジトリ直下のターミナルで、次を順に実行します。

```sh
npx supabase login
npx supabase link --project-ref <✏️ Project ref>
npx supabase db push
```

- `login` はブラウザが開くので Supabase にログインして許可する
- `link` の途中で **手順 1 の Database Password** を聞かれたら入力する
- `db push` で `supabase/migrations/` の 4 ファイルが適用され、テーブル・RLS・Storage バケット・Realtime 設定がすべて作られる

**確認**: Dashboard → **Table Editor** に `profiles` `listings` などが並び、各テーブルに「RLS enabled」と表示されていること。Dashboard → **Storage** に `avatars` `listing-images` `gallery-images` があること。

<details>
<summary>CLI を使わない場合（SQL Editor に貼り付ける方法）</summary>

Dashboard → **SQL Editor** で、`supabase/migrations/` のファイルを**ファイル名の順番どおりに** 1 つずつ貼り付けて実行してください。途中でエラーが出た場合は、それ以降を実行せずに止めてください。

</details>

### （任意）デモデータを入れる

`supabase/seed.sql` には 7 人のデモアカウント・17 件の出品・10 件の作品・会話が入っています。

> ⚠️ デモアカウントのパスワードはすべて `hazai-demo` で、このリポジトリを見た人は誰でもログインできます。**一般公開する本番プロジェクトには入れないでください。** 動作確認用の別プロジェクトで使うか、確認後に Dashboard → Authentication → Users からデモユーザーを削除してください。

入れる場合は Dashboard → **SQL Editor** に `supabase/seed.sql` の内容を貼り付けて実行します。

## 4. 認証（Authentication）を設定する

Dashboard → **Authentication** で次を設定します。

1. **Sign In / Providers → Email**
   - Enable Email provider: **ON**
   - Confirm email: **ON**（メールアドレスの確認を必須にする）
   - Minimum password length: **8**（アプリの入力チェックと合わせる）
2. **URL Configuration**（Vercel の URL が決まるまでは、いったん次の値にしておく）
   - Site URL: `http://localhost:8081`
   - Redirect URLs に追加: `http://localhost:8081/**`
3. **メール送信（重要）**
   Supabase 標準のメール送信は、**組織（Organization）のメンバーのメールアドレス宛てにしか届かず、送信数も 1 時間に数通まで**に制限されています（仕様は Dashboard の表示を確認してください）。
   - 開発中: 自分（組織メンバー）のメールアドレスで登録テストをする
   - 一般公開前: **Authentication → Emails → SMTP Settings** で独自の SMTP（Resend、SendGrid など）を設定する
     - ✏️ SMTP サーバーのホスト・ポート・ユーザー名・パスワード・送信元アドレス

## 5. ローカルで動作確認する

```sh
npm install
npx expo start --web
```

http://localhost:8081 を開き、[手順 9 の確認項目](#9-動作確認チェックリスト) のうち「新規登録」〜「チャット」を試します。

## 6. GitHub へ push する

変更をコミットし、GitHub（`origin`）へ push します。

```sh
git add -A
git commit -m "Supabase バックエンドへ移行"
git push origin main
```

`.env` がコミット対象に含まれていないことを `git status` で確認してから push してください。

## 7. Vercel にデプロイする

1. https://vercel.com にログインし（GitHub アカウントで連携）、**Add New → Project** からこのリポジトリを **Import**
2. Configure Project 画面で
   - Framework Preset: **Other**
   - Build / Output の設定は変更不要（リポジトリの `vercel.json` が使われる: `npx expo export --platform web` → `dist`）
   - **Environment Variables** に次の 2 つを追加（手順 2 と同じ値）
     - ✏️ `EXPO_PUBLIC_SUPABASE_URL`
     - ✏️ `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
3. **Deploy** を押す
4. ✏️ **控えておく値**: デプロイ後に表示される本番 URL（例: `https://hazai-bako.vercel.app`）

後から環境変数を追加・変更する場合は **Vercel → Project → Settings → Environment Variables** で設定し（Production と Preview の両方にチェック）、**Deployments → Redeploy** で再ビルドしてください（値はビルド時に埋め込まれるため）。

## 8. Supabase に本番 URL を登録する

Dashboard → **Authentication → URL Configuration**

| 項目 | 設定値 |
| --- | --- |
| Site URL | ✏️ 手順 7 の本番 URL（例: `https://hazai-bako.vercel.app`） |
| Redirect URLs | ✏️ `https://hazai-bako.vercel.app/**`<br>`http://localhost:8081/**`（ローカル開発を続ける場合） |

- プレビューデプロイ（ブランチごとの URL）でも確認メールを使う場合は、`https://*-<✏️ Vercel のチーム名>.vercel.app/**` も追加
- 将来ネイティブアプリを出す場合は `hazaibako://**` も追加

**独自ドメインに移行するとき**（例: `https://example.jp`）

1. Vercel → Project → Settings → **Domains** にドメインを追加し、表示される DNS レコードをドメインの管理画面（お名前.com など）に設定する
2. Supabase の Site URL を `https://example.jp` に変更し、Redirect URLs に `https://example.jp/**` を追加する

## 9. 動作確認チェックリスト

本番 URL（またはローカル）で確認してください。**2 つのアカウント（A・B）** を用意すると他人のデータに触れないことも確認できます（ブラウザの通常ウィンドウとシークレットウィンドウで別々にログイン）。

| # | 項目 | 確認方法 |
| --- | --- | --- |
| 1 | 新規登録 | マイページ → 新規登録。「確認メールを送信しました」と表示され、メールが届く |
| 2 | メール認証 | メールのリンクを開くと「メールアドレスを確認しました」と表示される |
| 3 | profiles 作成 | Dashboard → Table Editor → `profiles` に登録したユーザーの行がある |
| 4 | ログイン / ログアウト / 状態保持 | マイページ → 個人設定 → ログアウト、再ログイン。再読み込みしてもログインが続く |
| 5 | プロフィール編集 | マイページ → 編集。名前・自己紹介の変更と、画像の変更が反映される |
| 6 | 商品出品・画像アップロード | 「出品・投稿」ボタン → 端材を出品（画像付き）。「かう」に表示される。Storage → `listing-images/<ユーザーID>/` に画像がある |
| 7 | 商品編集・削除 | 自分の商品ページ → 編集する / 出品を取り消す（2 回押す） |
| 8 | 他人の商品を編集できない | B でログインして A の商品ページを開く → 編集ボタンが出ない。`/products/<A の商品ID>/edit` を直接開いても「この商品は編集できません」 |
| 9 | お気に入り | B で A の商品の ♡ を押す → 再読み込みしても維持される。もう一度押すと解除 |
| 10 | カート | B で「カートに追加」→ マイページ右上のカートに表示 → ゴミ箱で削除 |
| 11 | ギャラリー投稿 | 「出品・投稿」→ 作品を投稿（写真付き）→ ギャラリーに表示される |
| 12 | チャット・Realtime | B で A の商品の「出品者へ問い合わせる」→ メッセージ送信。A のメッセージ画面に**再読み込みなしで**届く |
| 13 | 会話外のユーザー | 3 つ目のアカウント C では、A と B の会話が一覧に出ない |
| 14 | 他人の Storage に書き込めない | `npm run test:db` の storage テストで検証済み（本番でも同じポリシーが適用される） |

RLS（8・13・14 など DB 側の制限）は、`npm run test:db` でも自動検証しています。

## 10. （スキーマを変更したとき）DB 型定義を再生成する

```sh
npx supabase gen types typescript --linked --schema public > src/lib/supabase/database.types.ts
npm run typecheck
npm run test:db
```

## （任意）Docker を使ったローカル Supabase

Docker Desktop を入れると、本番とは別のローカル Supabase で開発できます。

```sh
npx supabase start        # 初回は数分かかる。表示される API URL と Publishable key を .env に入れる
npx supabase db reset     # マイグレーションと seed.sql を適用（デモアカウントでログインできる）
```

確認メールは `npx supabase start` の出力に表示される Mailpit（Inbucket）の URL で確認できます。
