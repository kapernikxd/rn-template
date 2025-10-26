import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from 'rn-vs-lb/theme';
import AiBotService from '../../services/aibot/AiBotService';
import {
  GuestAiBotMessagePayload,
  GuestAiBotMessageResponse,
  GuestChatMessage,
} from '../../types/aiBot';
import { GuestAiChatModalView, PureChatMessage as ChatMessage } from 'rn-vs-lb';

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

  const listRef = useRef<FlatList<ChatMessage>>(null);

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
        console.warn('Failed to persist guest chat history', storageError);
      }
    },
    [historyStorageKey]
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
        console.warn('Failed to persist guest chat session', storageError);
      }
    },
    [sessionStorageKey]
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
    [persistHistory, persistSession, scrollToEnd, sessionId]
  );

  const handleSend = useCallback(async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isSending) return;

    if (remaining !== undefined && remaining <= 0) {
      setError('Достигнут дневной лимит. Пожалуйста, попробуйте позже.');
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
      console.error('Failed to send guest AI message', sendError);
      setError('Не удалось отправить сообщение. Попробуйте ещё раз.');
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
            console.warn('Failed to parse stored guest chat history', parseError);
            setMessages([]);
          }
        } else {
          setMessages([]);
        }

        if (storedSession) setSessionId(storedSession);
        else setSessionId(undefined);
      } catch (errorLoading) {
        console.warn('Failed to load guest chat data', errorLoading);
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
  }, [historyStorageKey, sessionStorageKey, scrollToEnd, visible]);

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
