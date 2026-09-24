import * as ImagePicker from 'expo-image-picker';

/** プレビュー用の uri と、アップロード用の base64 を併せて持つ */
export type PickedImage = {
  uri: string;
  base64: string;
};

export type PickImagesResult = {
  images: PickedImage[];
  /** 選ばれたが読み込めなかった画像があるか */
  hasUnreadable: boolean;
};

/** ライブラリから最大 limit 枚を選ぶ。キャンセル時は null */
export async function pickImagesFromLibrary(limit: number): Promise<PickImagesResult | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: true,
    selectionLimit: limit,
    quality: 0.7,
    // アップロードを Web・ネイティブ共通の JSON で行うため base64 で受け取る
    base64: true,
  });
  if (result.canceled) return null;

  const images = result.assets.flatMap((asset) =>
    typeof asset.base64 === 'string' ? [{ uri: asset.uri, base64: asset.base64 }] : [],
  );
  return { images: images.slice(0, limit), hasUnreadable: images.length < result.assets.length };
}
