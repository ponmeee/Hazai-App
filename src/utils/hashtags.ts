/**
 * ハッシュタグの正規化。DB の is_valid_tags() と同じ規則（「#」なし・小文字・空白や区切り文字なし・20 文字まで）に揃え、
 * 検索や関連作品の判定が表記ゆれで漏れないようにする。
 */
export const MAX_TAGS = 10;
export const MAX_TAG_LENGTH = 20;

const SEPARATORS = /[\s,、#＃]+/;

/** 1 つのタグを保存用の形にする。空になる場合は null */
export const normalizeTag = (raw: string): string | null => {
  const tag = raw.normalize('NFKC').replace(/[\s,、#＃]/g, '').toLowerCase().slice(0, MAX_TAG_LENGTH);
  return tag === '' ? null : tag;
};

/** 「#栗 #広葉樹」「栗、広葉樹」などの入力をタグの配列にする（重複は除く） */
export const parseTags = (text: string): string[] => {
  const tags = text.split(SEPARATORS).flatMap((part) => {
    const tag = normalizeTag(part);
    return tag === null ? [] : [tag];
  });
  return [...new Set(tags)];
};

/** 既存のタグに追加する。上限を超えた分は捨てる */
export const mergeTags = (current: string[], added: string[]): string[] =>
  [...new Set([...current, ...added])].slice(0, MAX_TAGS);

export const formatTag = (tag: string): string => `#${tag}`;
