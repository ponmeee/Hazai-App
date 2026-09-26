// Intl のロケール対応は実行環境（Hermes / ブラウザ）で差があるため自前で整形する
export const formatNumber = (value: number): string =>
  String(Math.trunc(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export const formatPrice = (price: number): string => `¥${formatNumber(price)}`;

/** 当日なら「14:05」、それ以外は「9/21 14:05」（端末のタイムゾーンで表示） */
export const formatDateTime = (iso: string, now: Date = new Date()): string => {
  const date = new Date(iso);
  const time = `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  return date.toDateString() === now.toDateString() ? time : `${date.getMonth() + 1}/${date.getDate()} ${time}`;
};

/** 「たった今」「5分前」「3時間前」「2日前」、1週間以上前は「9/21」 */
export const formatRelativeTime = (iso: string, now: Date = new Date()): string => {
  const date = new Date(iso);
  const minutes = Math.floor((now.getTime() - date.getTime()) / 60_000);
  if (minutes < 1) return 'たった今';
  if (minutes < 60) return `${minutes}分前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}時間前`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}日前`;
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

/** 「2026年9月26日」（端末のタイムゾーンで表示） */
export const formatDate = (iso: string): string => {
  const date = new Date(iso);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
};
