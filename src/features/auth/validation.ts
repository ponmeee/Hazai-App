/**
 * 入力中に分かる誤りだけを先に知らせるための簡易チェック。最終的な検証はサーバーで行う。
 */

export const PASSWORD_MIN_LENGTH = 8;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type LoginErrors = Partial<Record<'email' | 'password', string>>;
export type RegisterErrors = Partial<Record<'email' | 'password' | 'name', string>>;

const validateEmail = (email: string): string | undefined => {
  if (email.trim() === '') return 'メールアドレスを入力してください';
  if (!EMAIL_PATTERN.test(email.trim())) return 'メールアドレスの形式が正しくありません';
  return undefined;
};

const dropEmpty = <K extends string>(errors: Record<K, string | undefined>): Partial<Record<K, string>> =>
  Object.fromEntries(Object.entries(errors).filter(([, message]) => message !== undefined)) as Partial<
    Record<K, string>
  >;

export const validateLogin = (email: string, password: string): LoginErrors =>
  dropEmpty({
    email: validateEmail(email),
    password: password === '' ? 'パスワードを入力してください' : undefined,
  });

export const validateRegister = (email: string, password: string, name: string): RegisterErrors =>
  dropEmpty({
    email: validateEmail(email),
    password:
      password.length < PASSWORD_MIN_LENGTH
        ? `パスワードは${PASSWORD_MIN_LENGTH}文字以上で入力してください`
        : undefined,
    name: name.trim() === '' ? '名前を入力してください' : undefined,
  });
