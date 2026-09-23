# CLAUDE.md

## Project

「はざい箱」は、端材の売買と作品共有を組み合わせた
クリエイター向けフリマSNS Webアプリ。

主な利用者：
- 美大生
- ハンドメイド作家
- アーティスト
- DIY / クラフトを行う人

主要な価値：
1. 余った端材を必要な人に販売できる
2. 端材から生まれた作品を共有できる
3. 作品から素材を発見し、素材から作品を発見できる

---

## Tech Stack

- TypeScript
- React Native
- Expo
- expo-router
- Supabase

Supabaseでは主に以下を使用する。

- Auth
- PostgreSQL
- Storage
- Realtime

Webを第一の対象とするが、
将来的なiOS / Android展開を考慮する。

可能な限りReact Native / Expo共通コードを利用し、
不必要なWeb専用実装を避ける。

---

## Architecture Principles

以下を意識する。

- SOLID
- DRY
- KISS
- YAGNI

ただし、原則を守るための過剰な抽象化は禁止。

### 必須ルール

- TypeScriptの型を明示する
- `any`を安易に使用しない
- UIとビジネスロジックを可能な限り分離する
- 再利用可能なUIはcomponentsへ分離する
- 機能固有コードはfeaturesへまとめる
- Supabaseへのアクセス処理を画面コンポーネントへ直接大量に書かない
- ハードコードされた大量のモックデータを画面に置かない
- 巨大なコンポーネントを作らない
- 同じ処理を複数箇所にコピーしない
- 変更範囲を必要以上に広げない

---

## Routing

expo-routerを使用する。

Bottom Tab Navigation：

- ホーム
- かう
- ギャラリー
- マイページ

「端材出品」と「作品投稿」は完全に別フローとして扱う。

---

## Main Features

### Marketplace
- 商品検索
- カテゴリ検索
- 商品詳細
- 端材出品
- お気に入り
- カート
- 購入操作
- 出品者への問い合わせ

実決済は現段階では行わない。

### Gallery
- 作品一覧
- 作品投稿
- 作品詳細
- いいね
- コメント
- フォロー
- 保存
- シェア
- 使用素材タグ
- 使用した端材商品との紐付け

### Account
- メールアドレス認証
- プロフィール
- フォロー / フォロワー
- 購入履歴
- 出品履歴
- お気に入り
- 保存済み作品
- 個人設定

### Messaging
ユーザー間の実際のチャット機能を実装する。

Supabase Realtimeを利用できる構造にする。

### Notifications
通知情報はSupabaseに保存する。

最低限：
- メッセージ
- コメント
- いいね
- フォロー
- お気に入り素材の更新

Web版ではまずアプリ内通知を実装する。

---

## UI Principles

添付されたデザイン画像をUIの基準とする。

特徴：

- モバイルファースト
- 白を基調
- 写真を主役にする
- 十分な余白
- 大きめの角丸
- 控えめな色
- クラフト・自然素材と相性の良い落ち着いた雰囲気
- ミニマル
- 不必要な装飾を避ける

画像の情報構造・比率・余白感を尊重する。

完全なピクセルコピーより、
一貫したデザインシステムを優先する。

---

## Design System

色・spacing・border radius・typographyなどを
各画面へ直接ハードコードしすぎない。

以下のような共通定義を作成する。

- colors
- spacing
- radius
- typography
- shadows

共通UI：

- Header
- BottomTab
- SearchBar
- CategoryChip
- ProductCard
- GalleryPostCard
- UserAvatar
- SectionHeader
- EmptyState
- LoadingState
- ErrorState
- PrimaryButton
- FormInput

---

## Data

UIコンポーネントはSupabaseのデータ形式そのものに
必要以上に依存させない。

必要に応じてdomain typeへ変換する。

日時は文字列として無秩序に扱わず、
形式を統一する。

金額はnumberで保持する。

---

## Security

SupabaseではRow Level Securityを必ず前提とする。

クライアント側の判定だけで
データアクセスを保護しない。

- service_role keyをクライアントへ置かない
- 秘密情報をGitへコミットしない
- `.env`を使用する
- 認証ユーザーIDだけを信用して所有権を判断しない
- RLS Policyで権限を制御する

---

## Development Process

一度にアプリ全体を実装しない。

作業前に：

1. 現在のコードを確認
2. 実装対象を整理
3. 変更予定ファイルを確認

その後実装する。

大きな仕様判断が必要な場合は独断で決めない。

軽微な実装詳細については、
既存設計との整合性を優先して判断してよい。

---

## Validation

変更後は可能な範囲で以下を確認する。

- TypeScriptエラー
- lint
- routing
- import error
- runtime error
- responsive layout

エラーを無視して次の機能へ進まない。

---

## Code Quality

コメントはコードから明らかな内容の説明には使わない。

「なぜこの実装なのか」が分かりにくい箇所にのみ使用する。

関数名・変数名・コンポーネント名から
役割が理解できるコードを優先する。