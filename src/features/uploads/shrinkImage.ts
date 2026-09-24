import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

import type { PickedImage } from './pickImages';

/** 長辺が maxSize を超える画像を縮小し、JPEG にして返す */
export async function shrinkImage(image: PickedImage, maxSize: number): Promise<PickedImage> {
  const original = await ImageManipulator.manipulate(image.uri).renderAsync();
  const context = ImageManipulator.manipulate(image.uri);
  if (Math.max(original.width, original.height) > maxSize) {
    context.resize(original.width >= original.height ? { width: maxSize } : { height: maxSize });
  }
  const result = await (await context.renderAsync()).saveAsync({
    base64: true,
    compress: 0.8,
    format: SaveFormat.JPEG,
  });
  if (result.base64 === undefined) throw new Error('画像を変換できませんでした');
  return { uri: result.uri, base64: result.base64 };
}
