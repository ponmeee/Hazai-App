/**
 * Supabase の最小限の代役（auth / storage スキーマ、anon / authenticated ロール、auth.uid()）を
 * PGlite（WASM 版 PostgreSQL）上に用意し、supabase/migrations を順に適用する。
 * Docker なしで、マイグレーションの構文・トリガー・RLS・GRANT を実際の PostgreSQL で検証するためのもの。
 */
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { PGlite, type Transaction } from '@electric-sql/pglite';
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto';

const supabaseDir = join(import.meta.dirname, '..');

const SUPABASE_STUB = `
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;

  create schema auth;
  create schema storage;
  create schema extensions;
  create extension pgcrypto with schema extensions;

  create table auth.users (
    instance_id uuid,
    id uuid primary key default gen_random_uuid(),
    aud text,
    role text,
    email text unique,
    encrypted_password text,
    email_confirmed_at timestamptz,
    raw_app_meta_data jsonb not null default '{}',
    raw_user_meta_data jsonb not null default '{}',
    confirmation_token text,
    recovery_token text,
    email_change_token_new text,
    email_change text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
  );

  create table auth.identities (
    id uuid primary key default gen_random_uuid(),
    provider_id text not null,
    user_id uuid not null references auth.users (id) on delete cascade,
    identity_data jsonb not null,
    provider text not null,
    last_sign_in_at timestamptz,
    created_at timestamptz,
    updated_at timestamptz
  );

  -- Supabase と同じく JWT の sub をログイン中のユーザー ID とみなす
  create function auth.uid() returns uuid
  language sql stable
  as $$ select nullif(nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub', '')::uuid $$;

  create table storage.buckets (
    id text primary key,
    name text not null unique,
    public boolean default false,
    file_size_limit bigint,
    allowed_mime_types text[]
  );

  create table storage.objects (
    id uuid primary key default gen_random_uuid(),
    bucket_id text references storage.buckets (id),
    name text not null,
    owner uuid default auth.uid(),
    created_at timestamptz default now(),
    unique (bucket_id, name)
  );
  alter table storage.objects enable row level security;

  create function storage.foldername(name text) returns text[]
  language sql immutable
  as $$
    select (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1) - 1]
  $$;

  create publication supabase_realtime;

  -- Supabase の既定の権限付与を再現する（マイグレーション側の REVOKE / GRANT が効くことを確認するため）
  grant usage on schema public, auth, storage, extensions to anon, authenticated, service_role;
  grant execute on function auth.uid() to anon, authenticated, service_role;
  grant all on storage.objects to anon, authenticated, service_role;
  grant select on storage.buckets to anon, authenticated, service_role;
  alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
`;

export type Role = 'anon' | 'authenticated';

export type Harness = {
  db: PGlite;
  /** 指定したユーザー（userId なしは未ログイン）として 1 トランザクションで実行する */
  as: <T>(userId: string | null, run: (tx: Transaction) => Promise<T>) => Promise<T>;
  createUser: (email: string, metadata?: Record<string, string>) => Promise<string>;
};

export async function setupDatabase({ withSeed = false } = {}): Promise<Harness> {
  const db = new PGlite({ extensions: { pgcrypto } });
  await db.exec(SUPABASE_STUB);

  const migrationsDir = join(supabaseDir, 'migrations');
  const migrationFiles = (await readdir(migrationsDir)).filter((file) => file.endsWith('.sql')).sort();
  for (const file of migrationFiles) {
    try {
      await db.exec(await readFile(join(migrationsDir, file), 'utf8'));
    } catch (error) {
      throw new Error(`マイグレーション ${file} の適用に失敗しました: ${String(error)}`, { cause: error });
    }
  }
  if (withSeed) await db.exec(await readFile(join(supabaseDir, 'seed.sql'), 'utf8'));

  const as: Harness['as'] = (userId, run) =>
    db.transaction(async (tx) => {
      const role: Role = userId === null ? 'anon' : 'authenticated';
      await tx.exec(`set local role ${role}`);
      await tx.query(`select set_config('request.jwt.claims', $1, true)`, [
        JSON.stringify(userId === null ? { role } : { sub: userId, role }),
      ]);
      return run(tx);
    });

  const createUser: Harness['createUser'] = async (email, metadata = {}) => {
    const result = await db.query<{ id: string }>(
      'insert into auth.users (email, raw_user_meta_data) values ($1, $2) returning id',
      [email, JSON.stringify(metadata)],
    );
    const id = result.rows[0]?.id;
    if (id === undefined) throw new Error('ユーザーの作成に失敗しました');
    return id;
  };

  return { db, as, createUser };
}

/** 失敗することを確認したいクエリ用。PostgreSQL のエラーメッセージを返す */
export async function expectError(promise: Promise<unknown>): Promise<string> {
  try {
    await promise;
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
  throw new Error('エラーになるはずの操作が成功しました');
}
