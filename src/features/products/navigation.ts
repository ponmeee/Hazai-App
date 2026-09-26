import { router } from 'expo-router';

/** 「かう」でハッシュタグ検索する。複数あればいずれかに一致する出品を表示する */
export const openTagSearch = (tags: string[]): void => {
  router.push({ pathname: '/buy', params: { tags: tags.join(','), q: '' } });
};

/** ハッシュタグのない端材は名前で検索する */
export const openKeywordSearch = (keyword: string): void => {
  router.push({ pathname: '/buy', params: { q: keyword, tags: '' } });
};
