import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const serverRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = process.env.DATA_DIR ?? join(serverRoot, 'data');

const parseList = (value: string | undefined): string[] =>
  (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item !== '');

export const config = {
  port: Number(process.env.PORT ?? 8787),
  isProduction: process.env.NODE_ENV === 'production',
  dataDir,
  databasePath: join(dataDir, 'hazai.db'),
  uploadsDir: join(dataDir, 'uploads'),
  /** 開発時は localhost と LAN（プライベート IP）を許可済み。それ以外のオリジンはここで追加する */
  extraCorsOrigins: parseList(process.env.CORS_ORIGINS),
  sessionTtlDays: 30,
  maxUploadBytes: 8 * 1024 * 1024,
} as const;
