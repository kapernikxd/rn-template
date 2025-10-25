import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { ThemeType, useTheme } from 'rn-vs-lb/theme';
import AiBotService from '../../services/aibot/AiBotService';
import {
  GuestAiBotMessagePayload,
  GuestAiBotMessageResponse,
  GuestChatMessage,
} from '../../types/aiBot';

interface GuestAiChatModalProps {
  visible: boolean;
  onClose: () => void;
  botId: string;
  botName?: string;
}

type ChatMessage = GuestChatMessage & { id: string };

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
  const isAndroid = Platform.OS === 'android';
  const styles = useMemo(() => getStyles(theme, isAndroid), [theme, isAndroid]);

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

  const persistHistory = useCallback(async (history: ChatMessage[]) => {
    try {
      await AsyncStorage.setItem(historyStorageKey, JSON.stringify(history));
    } catch (storageError) {
      console.warn('Failed to persist guest chat history', storageError);
    }
  }, [historyStorageKey]);

  const persistSession = useCallback(async (session?: string) => {
    try {
      if (session) {
        await AsyncStorage.setItem(sessionStorageKey, session);
      } else {
        await AsyncStorage.removeItem(sessionStorageKey);
      }
    } catch (storageError) {
      console.warn('Failed to persist guest chat session', storageError);
    }
  }, [sessionStorageKey]);

  const handleResponse = useCallback(async (
    data: GuestAiBotMessageResponse,
    baseHistory: ChatMessage[],
  ) => {
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

    if (data.limit !== undefined) {
      setLimit(data.limit);
    }
    if (data.remainingRequests !== undefined) {
      setRemaining(data.remainingRequests);
    }
  }, [persistHistory, persistSession, scrollToEnd, sessionId]);

  const handleSend = useCallback(async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isSending) {
      return;
    }

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
      history: nextHistory.map(({ role, content }) => ({ role, content })),
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
  }, [botId, handleResponse, inputValue, isSending, messages, persistHistory, remaining, sessionId]);

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

        if (storedSession) {
          setSessionId(storedSession);
        } else {
          setSessionId(undefined);
        }
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
    if (visible) {
      scrollToEnd();
    }
  }, [messages, scrollToEnd, visible]);

  const renderItem = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageRow, isUser ? styles.rowEnd : styles.rowStart]}>
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.botBubble]}>
          <Text style={[typography.body, isUser ? styles.userText : styles.botText]}>{item.content}</Text>
        </View>
      </View>
    );
  };

  const disabled =
    isSending || !inputValue.trim() || (remaining !== undefined && remaining <= 0);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      transparent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.centered}
      >
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <View>
                <Text style={typography.titleH6}>{botName || 'AI-бот'}</Text>
                {limit !== undefined && remaining !== undefined && (
                  <Text style={styles.limitText}>
                    Осталось сообщений: {remaining} / {limit}
                  </Text>
                )}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={sizes.md} color={theme.text} />
            </TouchableOpacity>
          </View>

          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Спросите что-нибудь..."
              placeholderTextColor={theme.greyText}
              value={inputValue}
              onChangeText={setInputValue}
              editable={!isSending && (remaining === undefined || remaining > 0)}
              multiline
            />
            <TouchableOpacity
              onPress={handleSend}
              style={[styles.sendButton, disabled && styles.sendButtonDisabled]}
              disabled={disabled}
            >
              {isSending ? (
                <ActivityIndicator color={theme.white} />
              ) : (
                <Ionicons name="send" size={18} color={theme.white} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const getStyles = (theme: ThemeType, isAndroid: boolean) => StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: theme.backgroundSemiTransparent,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: theme.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24 + (isAndroid ? 25 : 0),
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.background,
  },
  limitText: {
    marginTop: 4,
    fontSize: 12,
    color: theme.greyText,
  },
  messagesContainer: {
    paddingBottom: 12,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  rowEnd: {
    justifyContent: 'flex-end',
  },
  rowStart: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '85%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  userBubble: {
    backgroundColor: theme.primary,
    borderBottomRightRadius: 2,
  },
  botBubble: {
    backgroundColor: theme.background,
    borderBottomLeftRadius: 2,
  },
  userText: {
    color: theme.white,
  },
  botText: {
    color: theme.text,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: theme.background,
    color: theme.text,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.primary,
    marginLeft: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  errorText: {
    color: theme.danger || '#E53935',
    marginBottom: 4,
    fontSize: 12,
  },
});

export default GuestAiChatModal;
