import { apiRequest } from '@/api/client';
import type { AccountDto, AuthResponseDto } from '@/api/dto';
import { toAccount } from '@/api/mappers';
import type { Account } from '@/types/models';

export type AuthSession = {
  token: string;
  account: Account;
};

export type RegisterInput = {
  email: string;
  password: string;
  name: string;
  location: string;
  genre: string;
};

export type ProfileInput = {
  name: string;
  location: string;
  genre: string;
  bio: string;
};

export type DemoAccounts = {
  password: string;
  accounts: { email: string; name: string; avatarUrl: string }[];
};

const toSession = (dto: AuthResponseDto): AuthSession => ({ token: dto.token, account: toAccount(dto.account) });

export const login = async (email: string, password: string): Promise<AuthSession> =>
  toSession(await apiRequest<AuthResponseDto>('/auth/login', { method: 'POST', body: { email, password } }));

export const register = async (input: RegisterInput): Promise<AuthSession> =>
  toSession(await apiRequest<AuthResponseDto>('/auth/register', { method: 'POST', body: input }));

export const logout = (): Promise<void> => apiRequest<void>('/auth/logout', { method: 'POST' });

export const fetchAccount = async (): Promise<Account> => toAccount(await apiRequest<AccountDto>('/me'));

export const updateProfile = async (input: ProfileInput): Promise<Account> =>
  toAccount(await apiRequest<AccountDto>('/me', { method: 'PATCH', body: input }));

/** 開発サーバーのみ提供される */
export const fetchDemoAccounts = (): Promise<DemoAccounts> => apiRequest<DemoAccounts>('/dev/demo-accounts');
