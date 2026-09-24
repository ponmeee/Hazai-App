import { REALTIME_URL } from '@/api/config';
import type { RealtimeEventDto } from '@/api/dto';
import { toMessage } from '@/api/mappers';
import type { Message } from '@/types/models';

const MAX_RETRY_DELAY_MS = 15_000;
const CLOSE_UNAUTHORIZED = 4401;

type Handlers = {
  onMessage: (message: Message) => void;
};

/**
 * 新着メッセージを受け取る接続を張り、切断されたら指数バックオフで再接続する。
 * Supabase Realtime へ移行する場合はこの関数の中身だけを差し替える。
 */
export function subscribeToMessages(token: string, { onMessage }: Handlers): () => void {
  let socket: WebSocket | null = null;
  let retryCount = 0;
  let retryTimer: ReturnType<typeof setTimeout> | undefined;
  let isUnsubscribed = false;

  const connect = () => {
    socket = new WebSocket(REALTIME_URL);
    socket.onopen = () => socket?.send(JSON.stringify({ type: 'auth', token }));
    socket.onmessage = (event: MessageEvent) => {
      const data = JSON.parse(String(event.data)) as RealtimeEventDto;
      if (data.type === 'ready') retryCount = 0;
      if (data.type === 'message.created') onMessage(toMessage(data.message));
    };
    socket.onclose = (event: CloseEvent) => {
      // 認証エラーは再接続しても解決しないため諦める（セッション切れは REST 側で検知してログアウトする）
      if (isUnsubscribed || event.code === CLOSE_UNAUTHORIZED) return;
      const delay = Math.min(1000 * 2 ** retryCount, MAX_RETRY_DELAY_MS);
      retryCount += 1;
      retryTimer = setTimeout(connect, delay);
    };
  };

  connect();

  return () => {
    isUnsubscribed = true;
    clearTimeout(retryTimer);
    socket?.close();
  };
}
