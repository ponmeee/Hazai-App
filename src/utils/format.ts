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
