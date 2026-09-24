import { isAuthError } from '@supabase/supabase-js';

/** 画面にそのまま表示してよいメッセージを持つエラー。api 層は必ずこれに変換して投げる */
export class AppError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'AppError';
  }
}

const CONNECTION_MESSAGE = 'サーバーに接続できません。通信環境を確認してください。';

const authMessages: Record<string, string> = {
  invalid_credentials: 'メールアドレスまたはパスワードが正しくありません',
  email_not_confirmed: 'メールアドレスの確認が完了していません。届いたメールのリンクを開いてください',
  user_already_exists: 'このメールアドレスは既に登録されています',
  email_exists: 'このメールアドレスは既に登録されています',
  weak_password: 'パスワードが弱すぎます。より長く複雑なパスワードにしてください',
  over_email_send_rate_limit: 'メールの送信回数が上限に達しました。しばらくしてからお試しください',
  over_request_rate_limit: '操作が多すぎます。しばらくしてからお試しください',
  signup_disabled: '現在、新規登録を受け付けていません',
  validation_failed: '入力内容が正しくありません',
};

const postgresMessages: Record<string, string> = {
  '23505': 'すでに登録されています',
  '23503': '対象のデータが見つかりません',
  '23514': '入力内容が正しくありません',
  '22P02': '見つかりませんでした',
  '42501': 'この操作は許可されていません',
  PGRST116: '見つかりませんでした',
};

type ErrorLike = { code?: unknown; message?: unknown; statusCode?: unknown };

const hasJapanese = (text: string): boolean => /[぀-ヿ一-鿿]/.test(text);

const isNetworkError = (message: string): boolean =>
  /failed to fetch|network request failed|load failed|fetch failed/i.test(message);

/**
 * Supabase（Auth / PostgREST / Storage）のエラーを利用者向けの文言へ変換する。
 * DB 関数が raise する日本語メッセージはそのまま使う。
 */
export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  if (isAuthError(error)) {
    if (error.name === 'AuthRetryableFetchError') return new AppError(CONNECTION_MESSAGE, { cause: error });
    const message = error.code === undefined ? undefined : authMessages[error.code];
    return new AppError(message ?? '認証に失敗しました', { cause: error });
  }

  const { code, message, statusCode } = (typeof error === 'object' && error !== null ? error : {}) as ErrorLike;
  const text = typeof message === 'string' ? message : '';

  if (isNetworkError(text)) return new AppError(CONNECTION_MESSAGE, { cause: error });
  if (hasJapanese(text)) return new AppError(text, { cause: error });
  if (typeof code === 'string' && postgresMessages[code] !== undefined) {
    return new AppError(postgresMessages[code], { cause: error });
  }
  // Storage API のエラー
  if (/row-level security/i.test(text) || statusCode === '403') {
    return new AppError('この操作は許可されていません', { cause: error });
  }
  if (/payload too large|exceeded the maximum allowed size/i.test(text) || statusCode === '413') {
    return new AppError('画像サイズが大きすぎます', { cause: error });
  }
  if (/mime type/i.test(text)) return new AppError('JPEG・PNG・WebP の画像を選択してください', { cause: error });

  return new AppError('エラーが発生しました。時間をおいてもう一度お試しください', { cause: error });
}

export const getErrorMessage = (error: unknown): string => toAppError(error).message;

/** Supabase のレスポンス（{ data, error }）から data を取り出し、エラーは AppError にして投げる */
export function unwrap<T>({ data, error }: { data: T | null; error: unknown }): T {
  if (error !== null && error !== undefined) throw toAppError(error);
  if (data === null) throw new AppError('見つかりませんでした');
  return data;
}
