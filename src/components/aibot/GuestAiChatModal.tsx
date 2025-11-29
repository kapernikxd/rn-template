import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'rn-vs-lb/theme';
import AiBotService from '../../services/aibot/AiBotService';
import {
  GuestAiBotMessagePayload,
  GuestAiBotMessageResponse,
  GuestChatMessage,
} from '../../types/aiBot';
import GuestAiChatModalView, { PureChatMessage as ChatMessage } from './GuestAiChatModalView';

interface GuestAiChatModalProps {
  visible: boolean;
  onClose: () => void;
  botId: string;
  botName?: string;
}

const MAX_HISTORY = 20;

const getHistoryStorageKey = (botId: string) => `guest_ai_history_${botId}`;
const getSessionStorageKey = (botId: string) => `guest_ai_session_${botId}`;

const createMessageId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const GuestAiChatModal: FC<GuestAiChatModalProps> = ({
  visible,
  onClose,
  botId,
  botName,
}) => {
  const { theme, typography, sizes } = useTheme();
  const { t } = useTranslation();

  const listRef = useRef<FlatList<ChatMessage>>(null);

  const defaultBotName = t('components.aibot.guestChat.defaultBotName');
  const inputPlaceholderText = t('components.aibot.guestChat.inputPlaceholder');
  const limitLabel = useCallback(
    (remaining: number, limitValue: number) =>
      t('components.aibot.guestChat.limitLabel', { remaining, limit: limitValue }),
    [t],
  );

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState<number | undefined>();
  const [remaining, setRemaining] = useState<number | undefined>();

  const historyStorageKey = useMemo(() => getHistoryStorageKey(botId), [botId]);
  const sessionStorageKey = useMemo(() => getSessionStorageKey(botId), [botId]);

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  }, []);

  const persistHistory = useCallback(
    async (history: ChatMessage[]) => {
      try {
        await AsyncStorage.setItem(historyStorageKey, JSON.stringify(history));
      } catch (storageError) {
        console.warn(
          t('components.aibot.guestChat.debug.persistHistoryFailed'),
          storageError,
        );
      }
    },
    [historyStorageKey, t],
  );

  const persistSession = useCallback(
    async (session?: string) => {
      try {
        if (session) {
          await AsyncStorage.setItem(sessionStorageKey, session);
        } else {
          await AsyncStorage.removeItem(sessionStorageKey);
        }
      } catch (storageError) {
        console.warn(
          t('components.aibot.guestChat.debug.persistSessionFailed'),
          storageError,
        );
      }
    },
    [sessionStorageKey, t],
  );

  const handleResponse = useCallback(
    async (data: GuestAiBotMessageResponse, baseHistory: ChatMessage[]) => {
      const reply = data.reply?.trim();
      if (reply) {
        const assistantMessage: ChatMessage = {
          id: createMessageId(),
          role: 'assistant',
          content: reply,
        };
        const updatedHistory = [...baseHistory, assistantMessage].slice(-MAX_HISTORY);
        setMessages(updatedHistory);
        await persistHistory(updatedHistory);
        scrollToEnd();
      }

      if (data.sessionId && data.sessionId !== sessionId) {
        setSessionId(data.sessionId);
        await persistSession(data.sessionId);
      }

      if (data.limit !== undefined) setLimit(data.limit);
      if (data.remainingRequests !== undefined) setRemaining(data.remainingRequests);
    },
    [persistHistory, persistSession, scrollToEnd, sessionId],
  );

  const handleSend = useCallback(async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isSending) return;

    if (remaining !== undefined && remaining <= 0) {
      setError(t('components.aibot.guestChat.errors.limitReached'));
      return;
    }

    setError(null);
    const userMessage: ChatMessage = { id: createMessageId(), role: 'user', content: trimmed };
    const nextHistory = [...messages, userMessage].slice(-MAX_HISTORY);

    setMessages(nextHistory);
    await persistHistory(nextHistory);
    setInputValue('');
    setIsSending(true);

    const payload: GuestAiBotMessagePayload = {
      message: trimmed,
      sessionId,
      history: nextHistory.map(({ role, content }) => ({ role, content })) as GuestChatMessage[],
    };

    try {
      const { data } = await AiBotService.sendGuestMessage(botId, payload);
      await handleResponse(data, nextHistory);
    } catch (sendError) {
      console.error(
        t('components.aibot.guestChat.debug.sendFailedLog'),
        sendError,
      );
      setError(t('components.aibot.guestChat.errors.sendFailed'));
      const revertedHistory = messages;
      setMessages(revertedHistory);
      await persistHistory(revertedHistory);
    } finally {
      setIsSending(false);
    }
  }, [
    botId,
    handleResponse,
    inputValue,
    isSending,
    messages,
    persistHistory,
    remaining,
    sessionId,
    t,
  ]);

  useEffect(() => {
    if (!visible) {
      setIsSending(false);
      setError(null);
      setInputValue('');
      setLimit(undefined);
      setRemaining(undefined);
      return;
    }

    let isMounted = true;

    const loadInitialData = async () => {
      try {
        const [storedHistory, storedSession] = await Promise.all([
          AsyncStorage.getItem(historyStorageKey),
          AsyncStorage.getItem(sessionStorageKey),
        ]);

        if (!isMounted) return;

        if (storedHistory) {
          try {
            const parsed: ChatMessage[] = JSON.parse(storedHistory);
            setMessages(parsed);
          } catch (parseError) {
            console.warn(
              t('components.aibot.guestChat.debug.parseHistoryFailed'),
              parseError,
            );
            setMessages([]);
          }
        } else {
          setMessages([]);
        }

        if (storedSession) setSessionId(storedSession);
        else setSessionId(undefined);
      } catch (errorLoading) {
        console.warn(
          t('components.aibot.guestChat.debug.loadDataFailed'),
          errorLoading,
        );
        setMessages([]);
        setSessionId(undefined);
      } finally {
        scrollToEnd();
      }
    };

    loadInitialData();

    return () => {
      isMounted = false;
      setError(null);
      setInputValue('');
    };
  }, [historyStorageKey, sessionStorageKey, scrollToEnd, visible, t]);

  useEffect(() => {
    if (visible) scrollToEnd();
  }, [messages, scrollToEnd, visible]);

  return (
    <GuestAiChatModalView
      visible={visible}
      onClose={onClose}
      botName={botName}
      messages={messages}
      inputValue={inputValue}
      error={error}
      isSending={isSending}
      limit={limit}
      remaining={remaining}
      defaultBotName={defaultBotName}
      limitLabel={limitLabel}
      inputPlaceholder={inputPlaceholderText}
      onChangeInput={setInputValue}
      onSend={handleSend}
      listRef={listRef}
      theme={theme}
      typography={typography}
      sizes={sizes}
    />
  );
};

export default GuestAiChatModal;
