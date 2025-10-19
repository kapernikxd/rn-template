import type { AuthUser } from "../../types/auth";

type JwtPayload = {
  exp?: number;
  sub?: string;
  user?: AuthUser;
  [key: string]: unknown;
};

const decodeBase64Url = (input: string): string => {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  const base64 = `${normalized}${padding}`;

  if (typeof globalThis.atob === 'function') {
    return globalThis.atob(base64);
  }

  const buffer = (globalThis as { Buffer?: { from: (data: string, encoding: string) => { toString: (encoding: string) => string } } }).Buffer;

  if (buffer) {
    return buffer.from(base64, 'base64').toString('utf-8');
  }

  throw new Error('No base64 decoder available in this environment');
};

export const decodeJwtPayload = <T = JwtPayload>(token: string): T | null => {
  const [, payload] = token.split('.');
  if (!payload) {
    return null;
  }

  try {
    const decoded = decodeBase64Url(payload);
    return JSON.parse(decoded) as T;
  } catch (error) {
    console.warn('Failed to decode JWT payload', error);
    return null;
  }
};

export const getTokenExpiration = (token: string): number | null => {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) {
    return null;
  }
  return payload.exp * 1000;
};

export const isTokenValid = (token: string, clockSkewMs = 5_000): boolean => {
  const expiration = getTokenExpiration(token);
  if (!expiration) {
    return false;
  }

  return expiration - clockSkewMs > Date.now();
};
