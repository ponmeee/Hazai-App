import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { z } from 'zod';

import { requireAuth } from '../auth/middleware.ts';
import { config } from '../config.ts';
import { badRequest, notFound, parseJsonBody, type AppEnv } from '../http.ts';

const FILE_NAME_PATTERN = /^[0-9a-f-]{36}\.(jpg|png|webp)$/;
export const UPLOADED_IMAGE_PATH_PATTERN = /^\/uploads\/[0-9a-f-]{36}\.(jpg|png|webp)$/;

type ImageType = { extension: 'jpg' | 'png' | 'webp'; contentType: string };

const contentTypes: Record<ImageType['extension'], string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

// 申告された MIME タイプは信用せず、ファイル先頭のシグネチャで画像形式を判定する
function detectImageType(bytes: Buffer): ImageType | null {
  if (bytes.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) {
    return { extension: 'jpg', contentType: contentTypes.jpg };
  }
  if (bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { extension: 'png', contentType: contentTypes.png };
  }
  if (bytes.subarray(0, 4).toString('ascii') === 'RIFF' && bytes.subarray(8, 12).toString('ascii') === 'WEBP') {
    return { extension: 'webp', contentType: contentTypes.webp };
  }
  return null;
}

const uploadSchema = z.object({
  data: z.string().min(1, '画像データがありません'),
});

export const uploadRoutes = new Hono<AppEnv>()
  .post(
    '/',
    requireAuth,
    // base64 は元のバイト数の約 4/3 になる
    bodyLimit({
      maxSize: Math.ceil((config.maxUploadBytes * 4) / 3) + 1024,
      onError: () => {
        throw badRequest('画像サイズが大きすぎます');
      },
    }),
    async (c) => {
      const { data } = await parseJsonBody(c, uploadSchema);
      const base64 = data.replace(/^data:[^;]+;base64,/, '');
      const bytes = Buffer.from(base64, 'base64');
      if (bytes.length === 0 || bytes.length > config.maxUploadBytes) {
        throw badRequest('画像サイズが大きすぎます');
      }
      const imageType = detectImageType(bytes);
      if (imageType === null) throw badRequest('JPEG・PNG・WebP の画像を選択してください');

      const fileName = `${randomUUID()}.${imageType.extension}`;
      await mkdir(config.uploadsDir, { recursive: true });
      await writeFile(join(config.uploadsDir, fileName), bytes);
      return c.json({ url: `/uploads/${fileName}` }, 201);
    },
  )
  .get('/:fileName', async (c) => {
    const fileName = c.req.param('fileName');
    const match = FILE_NAME_PATTERN.exec(fileName);
    if (match === null) throw notFound();
    let bytes: Buffer;
    try {
      bytes = await readFile(join(config.uploadsDir, fileName));
    } catch {
      throw notFound();
    }
    const extension = match[1] as ImageType['extension'];
    return c.body(new Uint8Array(bytes), 200, {
      'Content-Type': contentTypes[extension],
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    });
  });
