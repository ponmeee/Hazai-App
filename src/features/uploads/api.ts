import { apiRequest } from '@/api/client';

import type { PickedImage } from './pickImages';

const uploadImage = async (base64: string): Promise<string> =>
  (await apiRequest<{ url: string }>('/uploads', { method: 'POST', body: { data: base64 } })).url;

/** 選んだ順のまま、サーバー上の画像パスへ置き換える */
export const uploadImages = (images: PickedImage[]): Promise<string[]> =>
  Promise.all(images.map((image) => uploadImage(image.base64)));
