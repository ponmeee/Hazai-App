import { API_BASE_URL } from './config';

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

let authToken: string | null = null;
let handleUnauthorized: (() => void) | null = null;

export const setAuthToken = (token: string | null): void => {
  authToken = token;
};

export const getAuthToken = (): string | null => authToken;

/** ログイン中にセッション切れ (401) を受けたときの処理。AuthProvider が登録する */
export const setUnauthorizedHandler = (handler: (() => void) | null): void => {
  handleUnauthorized = handler;
};

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | undefined>;
};

const buildUrl = (path: string, query: RequestOptions['query']): string => {
  const params = Object.entries(query ?? {}).filter(
    (entry): entry is [string, string | number] => entry[1] !== undefined && entry[1] !== '',
  );
  const search = new URLSearchParams(params.map(([key, value]) => [key, String(value)])).toString();
  return `${API_BASE_URL}${path}${search === '' ? '' : `?${search}`}`;
};

export async function apiRequest<T>(path: string, { method = 'GET', body, query }: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (authToken !== null) headers.Authorization = `Bearer ${authToken}`;

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError('サーバーに接続できません。server が起動しているか確認してください。', 0);
  }

  if (response.status === 401 && authToken !== null) handleUnauthorized?.();

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: { message?: string } } | null;
    throw new ApiError(payload?.error?.message ?? 'エラーが発生しました', response.status);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const getErrorMessage = (error: unknown): string =>
  error instanceof ApiError ? error.message : '予期しないエラーが発生しました';
