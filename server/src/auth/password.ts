import { randomBytes, scrypt, timingSafeEqual, type BinaryLike } from 'node:crypto';

const KEY_LENGTH = 64;

const deriveKey = (password: BinaryLike, salt: Buffer): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, (error, key) => (error ? reject(error) : resolve(key)));
  });

/** 形式: scrypt$<salt(base64)>$<hash(base64)> */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await deriveKey(password, salt);
  return `scrypt$${salt.toString('base64')}$${key.toString('base64')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algorithm, saltBase64, hashBase64] = stored.split('$');
  if (algorithm !== 'scrypt' || saltBase64 === undefined || hashBase64 === undefined) return false;
  const expected = Buffer.from(hashBase64, 'base64');
  const actual = await deriveKey(password, Buffer.from(saltBase64, 'base64'));
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

// 存在しないメールアドレスでも照合と同じ時間をかけ、応答時間から登録有無を推測されにくくする
const dummyHash = await hashPassword(randomBytes(16).toString('hex'));
export const burnPasswordCheck = (password: string): Promise<boolean> => verifyPassword(password, dummyHash);
