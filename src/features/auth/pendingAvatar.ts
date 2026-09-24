import AsyncStorage from '@react-native-async-storage/async-storage';

import type { PickedImage } from '@/features/uploads/pickImages';

/**
 * 新規登録で選んだアイコン写真の一時保存。
 * メールアドレスの確認が済むまではログインできず Storage へアップロードできないため、
 * 端末に残しておき、同じメールアドレスで最初にログインしたときにアップロードする。
 */
const STORAGE_KEY = 'hazai.pendingAvatar';

type PendingAvatar = {
  email: string;
  base64: string;
};

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

export async function savePendingAvatar(email: string, image: PickedImage): Promise<void> {
  const pending: PendingAvatar = { email: normalizeEmail(email), base64: image.base64 };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
}

export async function clearPendingAvatar(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

/** 指定したメールアドレス宛ての写真があれば取り出して消す。別のアカウント宛てなら残しておく */
export async function takePendingAvatar(email: string): Promise<PickedImage | null> {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  if (stored === null) return null;

  let pending: PendingAvatar;
  try {
    pending = JSON.parse(stored) as PendingAvatar;
  } catch {
    await clearPendingAvatar();
    return null;
  }
  if (pending.email !== normalizeEmail(email)) return null;

  await clearPendingAvatar();
  return { uri: `data:image/jpeg;base64,${pending.base64}`, base64: pending.base64 };
}
