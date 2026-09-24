import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';

import { setupDatabase } from './harness.ts';

/**
 * src/lib/supabase/database.types.ts（手書き or `supabase gen types` の出力）が
 * マイグレーションで作られる実際のスキーマと一致しているかを確かめる。
 * 一致しないと、アプリ側の select や型推論が実行時にだけ失敗するため。
 */
const typesPath = join(import.meta.dirname, '..', '..', 'src', 'lib', 'supabase', 'database.types.ts');

/** Tables / Views の各 Row ブロックから列名を取り出す */
function parseRowColumns(source: string, section: 'Tables' | 'Views'): Map<string, string[]> {
  const sectionStart = source.indexOf(`    ${section}: {`);
  const nextSection = source.indexOf(section === 'Tables' ? '    Views: {' : '    Functions: {', sectionStart);
  const body = source.slice(sectionStart, nextSection);
  const result = new Map<string, string[]>();
  for (const match of body.matchAll(/^ {6}(\w+): \{\n {8}Row: \{\n([\s\S]*?)\n {8}\};/gm)) {
    const [, table, rowBody] = match;
    if (table === undefined || rowBody === undefined) continue;
    result.set(table, [...rowBody.matchAll(/^ {10}(\w+):/gm)].map((column) => column[1] ?? '').sort());
  }
  return result;
}

test('型定義のテーブル・ビューと列がスキーマと一致する', async () => {
  const source = (await readFile(typesPath, 'utf8')).replace(/\r\n/g, '\n');
  const h = await setupDatabase();

  for (const section of ['Tables', 'Views'] as const) {
    const expected = parseRowColumns(source, section);
    const relkind = section === 'Tables' ? 'r' : 'v';
    const actual = await h.db.query<{ table_name: string; columns: string[] }>(
      `select c.relname as table_name, array_agg(a.attname::text order by a.attname) as columns
       from pg_class c
       join pg_namespace n on n.oid = c.relnamespace
       join pg_attribute a on a.attrelid = c.oid and a.attnum > 0 and not a.attisdropped
       where n.nspname = 'public' and c.relkind = $1
       group by c.relname`,
      [relkind],
    );
    const actualMap = new Map(actual.rows.map((row) => [row.table_name, [...row.columns].sort()]));
    assert.deepEqual([...expected.keys()].sort(), [...actualMap.keys()].sort(), `${section} の一覧が異なります`);
    for (const [table, columns] of expected) {
      assert.deepEqual(columns, actualMap.get(table), `${table} の列が異なります`);
    }
  }
});

test('型定義の外部キー名がスキーマに存在する（select の埋め込み指定で使う）', async () => {
  const source = await readFile(typesPath, 'utf8');
  const h = await setupDatabase();
  const expected = [...source.matchAll(/foreignKeyName: '(\w+)'/g)].map((match) => match[1] ?? '').sort();
  const actual = await h.db.query<{ conname: string }>(
    `select conname from pg_constraint c
     join pg_namespace n on n.oid = c.connamespace
     where n.nspname = 'public' and c.contype = 'f' and c.confrelid <> 'auth.users'::regclass
     order by conname`,
  );
  assert.deepEqual(expected, actual.rows.map((row) => row.conname).sort());
});

test('型定義の RPC がスキーマに存在する', async () => {
  const source = (await readFile(typesPath, 'utf8')).replace(/\r\n/g, '\n');
  const functionsBody = source.slice(source.indexOf('    Functions: {'), source.indexOf('    Enums: {'));
  const expected = [...functionsBody.matchAll(/^ {6}(\w+): \{/gm)].map((match) => match[1] ?? '').sort();
  const h = await setupDatabase();
  const actual = await h.db.query<{ proname: string }>(
    `select p.proname from pg_proc p
     join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public' and has_function_privilege('authenticated', p.oid, 'execute')
     order by p.proname`,
  );
  assert.deepEqual(expected, actual.rows.map((row) => row.proname).sort());
});
