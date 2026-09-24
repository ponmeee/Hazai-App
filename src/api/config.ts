import Constants from 'expo-constants';
import { Platform } from 'react-native';

const DEFAULT_SERVER_PORT = 8787;

function resolveApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv !== undefined && fromEnv !== '') return fromEnv.replace(/\/$/, '');

  // 開いているページと同じホストで動くサーバーを使う（LAN の IP で開いた場合も届くように）
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `http://${window.location.hostname}:${DEFAULT_SERVER_PORT}`;
  }

  // 実機・エミュレータからは localhost が端末自身を指すため、Metro の接続先（開発 PC）を使う
  const devServerHost = Constants.expoConfig?.hostUri?.split(':')[0];
  return `http://${devServerHost ?? 'localhost'}:${DEFAULT_SERVER_PORT}`;
}

export const API_BASE_URL = resolveApiBaseUrl();
export const REALTIME_URL = `${API_BASE_URL.replace(/^http/, 'ws')}/ws`;

/** サーバーにアップロードした画像は相対パスで返るため、表示用に絶対 URL へ変換する */
export const resolveAssetUrl = (url: string): string => (url.startsWith('/') ? `${API_BASE_URL}${url}` : url);
