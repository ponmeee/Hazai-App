import { randomUUID } from 'expo-crypto';

import { AppError, toAppError } from '@/api/errors';
import type { PickedImage } from '@/features/uploads/pickImages';

import { supabase } from './client';

export type StorageBucket = 'avatars' | 'listing-images' | 'gallery-images';

type ImageType = { mimeType: string; extension: string };

// ファイル先頭のシグネチャ（base64 の先頭文字列）で形式を判定する。拡張子や申告値は信用しない
const imageSignatures: { prefix: string; type: ImageType }[] = [
  { prefix: '/9j/', type: { mimeType: 'image/jpeg', extension: 'jpg' } },
  { prefix: 'iVBORw0KGgo', type: { mimeType: 'image/png', extension: 'png' } },
  { prefix: 'UklGR', type: { mimeType: 'image/webp', extension: 'webp' } },
];

const detectImageType = (base64: string): ImageType | null =>
  imageSignatures.find(({ prefix }) => base64.startsWith(prefix))?.type ?? null;

const decodeBase64 = (base64: string): Uint8Array => Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));

/** DB には Storage 内のパスを保存し、表示時に公開 URL へ変換する（デモデータは外部 URL をそのまま使う） */
export const getPublicImageUrl = (bucket: StorageBucket, path: string): string =>
  /^https?:\/\//.test(path) ? path : supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;

async function requireUserId(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const userId = data.session?.user.id;
  if (userId === undefined) throw new AppError('ログインが必要です');
  return userId;
}

/** {user_id}/{uuid}.{ext} に保存し、Storage 内のパスを返す（他人のフォルダへの書き込みは Storage Policy で拒否される） */
export async function uploadImage(bucket: StorageBucket, image: PickedImage): Promise<string> {
  const imageType = detectImageType(image.base64);
  if (imageType === null) throw new AppError('JPEG・PNG・WebP の画像を選択してください');

  const path = `${await requireUserId()}/${randomUUID()}.${imageType.extension}`;
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, decodeBase64(image.base64), { contentType: imageType.mimeType, upsert: false });
  if (error !== null) throw toAppError(error);
  return path;
}

/** 選んだ順のままアップロードする。途中で失敗したら、それまでにアップロードした画像を消す */
export async function uploadImages(bucket: StorageBucket, images: PickedImage[]): Promise<string[]> {
  const results = await Promise.allSettled(images.map((image) => uploadImage(bucket, image)));
  const paths = results.flatMap((result) => (result.status === 'fulfilled' ? [result.value] : []));
  const failure = results.find((result): result is PromiseRejectedResult => result.status === 'rejected');
  if (failure !== undefined) {
    await removeImages(bucket, paths);
    throw toAppError(failure.reason);
  }
  return paths;
}

/** 不要になった画像の後片付け。失敗しても本来の操作は成功扱いにするため、エラーは握りつぶす */
export async function removeImages(bucket: StorageBucket, paths: string[]): Promise<void> {
  const storagePaths = paths.filter((path) => !/^https?:\/\//.test(path));
  if (storagePaths.length === 0) return;
  await supabase.storage.from(bucket).remove(storagePaths).catch(() => undefined);
}
