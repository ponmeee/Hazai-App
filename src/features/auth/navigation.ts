import { goBackOr } from '@/utils/navigation';

/** ログイン・登録の完了後は、ログインを求められた元の画面へ戻す */
export const leaveAuthScreen = (): void => goBackOr('/mypage');
