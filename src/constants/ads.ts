import type { ChatLimitConfig } from '../types/config';

export const DEFAULT_CHAT_LIMIT_CONFIG: ChatLimitConfig = {
  messageLimit: 20,
  cooldownMs: 90 * 60 * 1000,
  tokenCost: 20,
  scope: 'global',
};
