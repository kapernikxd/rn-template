import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { getTokenBalance, subtractTokens } from '../../helpers/tokenStorage';
import { SnackbarType } from '../../types/ui';
import { formatDuration } from '../utils/time';
import {
  buildChatLimitStorageKey,
  loadChatLimitState,
  persistChatLimitState,
  resetChatLimitState,
  type ChatMessageLimitConfig,
  type ChatLimitPersistedState,
  type ChatLimitSnapshot,
} from './chatLimitStorage';

export type { ChatMessageLimitConfig } from './chatLimitStorage';

export type LimitCheckResult =
  | { ok: true; remaining: number }
  | { ok: false; reason: 'cooldown' | 'limit'; cooldownMsRemaining: number };

export type UnlockResult =
  | { ok: true; balance: number }
  | { ok: false; reason: 'insufficient_tokens' | 'error'; balance: number | null };

const DEFAULT_CONFIG: ChatMessageLimitConfig = {
  messageLimit: 25,
  cooldownMs: 90 * 60 * 1000,
  tokenCost: 20,
  storageKeyPrefix: 'chat.limit',
  scope: 'global',
};

export function useChatMessageLimit(
  chatId: string,
  partialConfig?: Partial<ChatMessageLimitConfig>,
) {
  const config = useMemo<ChatMessageLimitConfig>(
    () => ({ ...DEFAULT_CONFIG, ...partialConfig }),
    [partialConfig],
  );

  const storageKey = useMemo(
    () => buildChatLimitStorageKey(chatId, config),
    [chatId, config],
  );

  const [state, setState] = useState<ChatLimitPersistedState>({
    remaining: config.messageLimit,
    cooldownUntil: null,
    updatedAt: Date.now(),
  });
  const [cooldownMsLeft, setCooldownMsLeft] = useState<number>(0);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const syncState = useCallback(
    async (snapshot?: ChatLimitSnapshot): Promise<ChatLimitPersistedState> => {
      try {
        const latest = snapshot
          ? await persistChatLimitState(storageKey, snapshot, config)
          : await loadChatLimitState(storageKey, config);

        setState(latest);
        return latest;
      } catch (error) {
        console.warn('Failed to sync chat limit state', error);
        const fallback = await resetChatLimitState(storageKey, config);
        setState(fallback);
        return fallback;
      }
    },
    [config, storageKey],
  );

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      await syncState();
      if (isMounted) {
        setIsInitialized(true);
      }
    };

    void initialize();

    return () => {
      isMounted = false;
    };
  }, [syncState]);

  const refreshTokenBalance = useCallback(async () => {
    try {
      const balance = await getTokenBalance();
      setTokenBalance(balance);
      return balance;
    } catch (error) {
      console.warn('Failed to load token balance', error);
      setTokenBalance(null);
      return null;
    }
  }, []);

  useEffect(() => {
    void refreshTokenBalance();
  }, [refreshTokenBalance]);

  useEffect(() => {
    if (cooldownTimerRef.current) {
      clearInterval(cooldownTimerRef.current);
      cooldownTimerRef.current = null;
    }

    if (!state.cooldownUntil) {
      setCooldownMsLeft(0);
      return;
    }

    const updateCountdown = () => {
      const msLeft = state.cooldownUntil ? state.cooldownUntil - Date.now() : 0;
      if (msLeft <= 0) {
        setCooldownMsLeft(0);
        void syncState({ remaining: config.messageLimit, cooldownUntil: null });
        return;
      }

      setCooldownMsLeft(msLeft);
    };

    updateCountdown();
    cooldownTimerRef.current = setInterval(updateCountdown, 1000);

    return () => {
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
        cooldownTimerRef.current = null;
      }
    };
  }, [state.cooldownUntil, config.messageLimit, syncState]);

  const ensureCanSend = useCallback(async (): Promise<LimitCheckResult> => {
    const latestState = await syncState();
    const now = Date.now();

    if (latestState.cooldownUntil && latestState.cooldownUntil > now) {
      return { ok: false, reason: 'cooldown', cooldownMsRemaining: latestState.cooldownUntil - now };
    }

    if (latestState.remaining <= 0) {
      return { ok: false, reason: 'limit', cooldownMsRemaining: 0 };
    }

    return { ok: true, remaining: latestState.remaining };
  }, [syncState]);

  const registerSuccessfulSend = useCallback(async () => {
    const current = await syncState();
    const nextRemaining = Math.max(0, current.remaining - 1);

    if (nextRemaining <= 0) {
      const nextState: ChatLimitSnapshot = {
        remaining: 0,
        cooldownUntil: Date.now() + config.cooldownMs,
      };
      await syncState(nextState);
      return;
    }

    const nextState: ChatLimitSnapshot = {
      remaining: nextRemaining,
      cooldownUntil: null,
    };
    await syncState(nextState);
  }, [config.cooldownMs, syncState]);

  const unlockWithTokens = useCallback(async (): Promise<UnlockResult> => {
    setIsUnlocking(true);
    try {
      const balance = await refreshTokenBalance();
      if (balance === null) {
        return { ok: false, reason: 'error', balance: null };
      }

      if (balance < config.tokenCost) {
        return { ok: false, reason: 'insufficient_tokens', balance };
      }

      const updatedBalance = await subtractTokens(config.tokenCost);
      setTokenBalance(updatedBalance);
      await syncState({ remaining: config.messageLimit, cooldownUntil: null });
      return { ok: true, balance: updatedBalance };
    } catch (error) {
      console.warn('Failed to unlock chat limit', error);
      return { ok: false, reason: 'error', balance: tokenBalance };
    } finally {
      setIsUnlocking(false);
    }
  }, [config.messageLimit, config.tokenCost, refreshTokenBalance, syncState, tokenBalance]);

  const resetLimits = useCallback(async () => {
    await syncState({ remaining: config.messageLimit, cooldownUntil: null });
  }, [config.messageLimit, syncState]);

  const isCooldownActive = state.cooldownUntil !== null && state.cooldownUntil > Date.now();
  const isLocked = isCooldownActive || state.remaining <= 0;

  return {
    config,
    remainingMessages: state.remaining,
    cooldownEndsAt: state.cooldownUntil,
    cooldownMsLeft,
    tokenBalance,
    isUnlocking,
    isCooldownActive,
    isLocked,
    isInitialized,
    ensureCanSend,
    registerSuccessfulSend,
    unlockWithTokens,
    refreshTokenBalance,
    resetLimits,
  };
}

type SubmitHandler<TPayload = unknown> = (payload?: TPayload) => Promise<boolean>;

interface UseChatMessageLimitControllerParams<TPayload = unknown> {
  chatId: string;
  onSubmit: SubmitHandler<TPayload>;
  isEditingMessage: boolean;
  showSnackbar: (message: string, type: SnackbarType) => void;
  config?: Partial<ChatMessageLimitConfig>;
}

export function useChatMessageLimitController<TPayload = unknown>({
  chatId,
  onSubmit,
  isEditingMessage,
  showSnackbar,
  config,
}: UseChatMessageLimitControllerParams<TPayload>) {
  const limit = useChatMessageLimit(chatId, config);

  const countdownText = useMemo(() => {
    if (!limit.cooldownMsLeft) return null;
    return formatDuration(limit.cooldownMsLeft);
  }, [limit.cooldownMsLeft]);

  const handleUnlock = useCallback(async () => {
    const result = await limit.unlockWithTokens();
    if (result.ok) {
      showSnackbar('Лимит сообщений сброшен.', 'success');
      return result;
    }

    if (result.reason === 'insufficient_tokens') {
      showSnackbar('Недостаточно токенов для разблокировки.', 'warning');
      return result;
    }

    showSnackbar('Не удалось разблокировать чат. Попробуйте позже.', 'error');
    return result;
  }, [limit, showSnackbar]);

  const handleSubmit = useCallback<SubmitHandler<TPayload>>(
    async (payload) => {
      if (!isEditingMessage) {
        const check = await limit.ensureCanSend();
        if (!check.ok) {
          if (check.reason === 'cooldown' && check.cooldownMsRemaining > 0) {
            showSnackbar(
              `Лимит сообщений исчерпан. Подождите ${formatDuration(check.cooldownMsRemaining)} или используйте токены.`,
              'warning',
            );
          } else {
            showSnackbar('Лимит сообщений исчерпан. Подождите окончания таймера.', 'warning');
          }

          return false;
        }
      }

      const sent = await onSubmit(payload);
      if (sent && !isEditingMessage) {
        await limit.registerSuccessfulSend();
      }

      return sent;
    },
    [isEditingMessage, limit, onSubmit, showSnackbar],
  );

  return {
    ...limit,
    countdownText,
    handleUnlock,
    handleSubmit,
  };
}

export default useChatMessageLimit;
