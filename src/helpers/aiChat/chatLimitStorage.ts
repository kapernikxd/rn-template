import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ChatMessageLimitConfig {
  messageLimit: number;
  cooldownMs: number;
  tokenCost: number;
  storageKeyPrefix?: string;
  scope?: 'chat' | 'global';
}

export interface ChatLimitSnapshot {
  remaining: number;
  cooldownUntil: number | null;
}

export interface ChatLimitPersistedState extends ChatLimitSnapshot {
  updatedAt: number;
}

const DEFAULT_STORAGE_PREFIX = 'chat.limit';

const clampRemaining = (value: unknown, messageLimit: number) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return messageLimit;
  }

  return Math.max(0, Math.min(messageLimit, Math.floor(value)));
};

const normalizeState = (
  rawState: Partial<ChatLimitPersistedState> | null,
  config: ChatMessageLimitConfig,
): ChatLimitPersistedState => {
  const remaining = clampRemaining(rawState?.remaining, config.messageLimit);
  const cooldownUntil = typeof rawState?.cooldownUntil === 'number' ? rawState.cooldownUntil : null;

  if (cooldownUntil && cooldownUntil <= Date.now()) {
    return {
      remaining: config.messageLimit,
      cooldownUntil: null,
      updatedAt: Date.now(),
    };
  }

  return {
    remaining,
    cooldownUntil,
    updatedAt: Date.now(),
  };
};

export const buildChatLimitStorageKey = (
  chatId: string,
  config: ChatMessageLimitConfig,
) => {
  const prefix = config.storageKeyPrefix ?? DEFAULT_STORAGE_PREFIX;
  if (config.scope === 'global') {
    return `${prefix}:global`;
  }

  return `${prefix}:${chatId}`;
};

export const loadChatLimitState = async (
  storageKey: string,
  config: ChatMessageLimitConfig,
): Promise<ChatLimitPersistedState> => {
  const raw = await AsyncStorage.getItem(storageKey);

  if (!raw) {
    const initial = {
      remaining: config.messageLimit,
      cooldownUntil: null,
      updatedAt: Date.now(),
    } satisfies ChatLimitPersistedState;

    await AsyncStorage.setItem(storageKey, JSON.stringify(initial));
    return initial;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<ChatLimitPersistedState> | null;
    const normalized = normalizeState(parsed, config);
    await AsyncStorage.setItem(storageKey, JSON.stringify(normalized));
    return normalized;
  } catch (error) {
    console.warn('Failed to parse chat limit state', error);
    const fallback = {
      remaining: config.messageLimit,
      cooldownUntil: null,
      updatedAt: Date.now(),
    } satisfies ChatLimitPersistedState;
    await AsyncStorage.setItem(storageKey, JSON.stringify(fallback));
    return fallback;
  }
};

export const persistChatLimitState = async (
  storageKey: string,
  state: ChatLimitSnapshot,
  config: ChatMessageLimitConfig,
): Promise<ChatLimitPersistedState> => {
  const normalized = normalizeState({ ...state, updatedAt: Date.now() }, config);
  await AsyncStorage.setItem(storageKey, JSON.stringify(normalized));
  return normalized;
};

export const resetChatLimitState = async (
  storageKey: string,
  config: ChatMessageLimitConfig,
): Promise<ChatLimitPersistedState> => {
  const resetState: ChatLimitPersistedState = {
    remaining: config.messageLimit,
    cooldownUntil: null,
    updatedAt: Date.now(),
  };

  await AsyncStorage.setItem(storageKey, JSON.stringify(resetState));
  return resetState;
};

export const clearChatLimitState = async (storageKey: string) => {
  await AsyncStorage.removeItem(storageKey);
};
