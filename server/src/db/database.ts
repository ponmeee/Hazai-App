import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync, type SQLInputValue } from 'node:sqlite';

import { config } from '../config.ts';
import { migrate } from './schema.ts';

type Params = Record<string, SQLInputValue>;

function openDatabase(path: string): DatabaseSync {
  mkdirSync(dirname(path), { recursive: true });
  const database = new DatabaseSync(path);
  database.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  migrate(database);
  return database;
}

export const db = openDatabase(config.databasePath);

// node:sqlite は行を Record<string, SQLOutputValue> で返すため、行の型付けはこの境界に集約する
export const queryAll = <T>(sql: string, params: Params = {}): T[] =>
  db.prepare(sql).all(params) as unknown as T[];

export const queryOne = <T>(sql: string, params: Params = {}): T | undefined =>
  db.prepare(sql).get(params) as unknown as T | undefined;

export const execute = (sql: string, params: Params = {}): void => {
  db.prepare(sql).run(params);
};

export function transaction<T>(fn: () => T): T {
  db.exec('BEGIN');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

export const nowIso = (): string => new Date().toISOString();
