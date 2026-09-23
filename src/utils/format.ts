// Intl のロケール対応は実行環境（Hermes / ブラウザ）で差があるため自前で区切る
export const formatNumber = (value: number): string =>
  String(Math.trunc(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export const formatPrice = (price: number): string => `¥${formatNumber(price)}`;
