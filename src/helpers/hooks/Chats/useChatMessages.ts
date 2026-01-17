import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, FlatList } from 'react-native';
import { useFocusEffect, useRoute, type RouteProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from 'react-i18next';

import { useRootStore } from '../../../store/StoreProvider';
import { generateMessagesWithDates } from '../../../helpers/utils/date';
import { getUserAvatar, getUserFullName } from '../../../helpers/utils/user';
import { saveImageToPhotos, shareImageFromUrl } from '../../utils/media';
import { resolveMessageContextForCategories } from '../../aiChat/resolveMessageContext';
import { AnalyticsEvent, trackEvent } from '../../../services/analytics/events';

import type { ChatsStackParamList } from '../../../navigation';
import type { ImageAsset } from 'rn-vs-lb';
import type { MessageDTOExtented } from '../../../types';

const OFFSET = 30;

export type SelectedActionType = 'reply' | 'edit' | 'copy' | 'forward' | 'select';

export type MessageDTOWithAction = MessageDTOExtented & {
  actionType?: SelectedActionType;
};

type ChatMessagesRoute = RouteProp<ChatsStackParamList, 'ChatMessages'>;

const pickImages = async (max = 1): Promise<ImageAsset[]> => {
  const res = await ImagePicker.launchImageLibraryAsync({
    allowsMultipleSelection: max > 1,
    quality: 0.9,
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
  });
  if (res.canceled) return [];
  const assets = (res.assets ?? []).slice(0, max);
  return assets.map(a => ({
    uri: a.uri,
    width: a.width,
    height: a.height,
    fileName: (a as any).fileName,
    mimeType: (a as any).mimeType,
  }));
};

export function useChatMessages() {
  const route = useRoute<ChatMessagesRoute>();
  const chatId = route.params.chatId;

  const { chatStore, authStore, uiStore, onlineStore } = useRootStore();
  const { t, i18n } = useTranslation();

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [skip, setSkip] = useState(0);

  const myId = authStore.getMyId();
  const flatListRef = useRef<FlatList>(null);
  const viewedChatIdRef = useRef<string | null>(null);

  const [editMode, setEditMode] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<MessageDTOWithAction | null>(null);

  const toggleMode = () => setEditMode(prev => !prev);
  const exitEditMode = () => {
    setEditMode(false);
    setSelectedMessage(null);
  };

  const loadMoreMessages = useCallback(async () => {
    if (chatStore.messages.length >= skip + OFFSET) {
      const next = skip + OFFSET;
      setSkip(next);
      void trackEvent(AnalyticsEvent.ChatMessagesLoadMore, {
        chatId,
        nextOffset: next,
      });
      await chatStore.fetchChatMessages(chatId, next);
    }
  }, [chatId, skip, chatStore]);

  const lastMessage = chatStore.messages[chatStore.messages.length - 1] ?? undefined;

  const [inputMessage, setInputMessage] = useState<string>('');
  const groupedMessages = generateMessagesWithDates(chatStore.messages.slice());

  const user = chatStore?.selectedChat?.users?.find(u => u?._id !== myId);
  const users = chatStore?.selectedChat?.users?.filter(u => u?._id !== myId) ?? [];
  const lastReadMessageIdOpponent = chatStore?.lastReadedMessage?.lastReadedMessageId || null;

  const chatTitle =
    getUserFullName(user!) ?? t('components.chat.messages.title.privateChat');
  const chatImg = getUserAvatar(user!);
  const isGroupChat = chatStore.isGroupChat;

  const botCategories = chatStore.selectedChat?.categories ?? [];

  // Primary load and re-focus initialization for the chat screen.
  useFocusEffect(
    useCallback(() => {
      if (!myId) return;

      let isMounted = true;
      const init = async () => {
        setIsLoading(true);

        onlineStore.setCurrentRoutName('chatMessages');

        await onlineStore.ensureConnectedAndJoined([chatId]);
        chatStore.subscribeToChat(chatId);

        await Promise.all([
          chatStore.fetchChatMessages(chatId),
          chatStore.fetchChat(chatId, myId),
          chatStore.loadPinnedMessages(chatId),
        ]);

        if (!chatStore.isGroupChat && chatStore.opponentId) {
          await chatStore.getLastReadedMessage({ chatId, userId: chatStore.opponentId });
        }

        if (isMounted) setIsLoading(false);
      };

      const appStateSub = AppState.addEventListener('change', async (state) => {
        if (state === 'active') {
          await onlineStore.ensureConnectedAndJoined([chatId]);
          chatStore.subscribeToChat(chatId);
          chatStore.fetchChatMessages(chatId);
        }
      });

      void init();

      return () => {
        isMounted = false;
        appStateSub.remove();
        onlineStore.setCurrentRoutName('');
        chatStore.unsubscribeFromChat(chatId);
        chatStore.cleanMessages();
        chatStore.cleanOpponentId();
      };
    }, [chatId, myId, chatStore, onlineStore])
  );

  useEffect(() => {
    const chat = chatStore.selectedChat;
    if (!chat?._id) return;

    if (viewedChatIdRef.current !== chat._id) {
      viewedChatIdRef.current = chat._id;
      const chatType = chat.categories?.length ? 'bot' : chat.isGroupChat ? 'group' : 'private';
      void trackEvent(AnalyticsEvent.ChatMessagesViewed, {
        chatId: chat._id,
        chatType,
      });
    }
  }, [chatStore.selectedChat]);

  // Auto-mark the latest incoming message as read so badges stay in sync.
  useEffect(() => {
    const hasId = !!lastMessage?._id;
    const notMine = lastMessage?.sender?._id !== myId;
    if (hasId && notMine) {
      chatStore.markChatAsRead({ chatId, messageId: lastMessage._id });
    }
  }, [lastMessage, chatId, myId, chatStore]);

  // Prefill the input when switching into edit mode.
  useEffect(() => {
    if (selectedMessage?.actionType === 'edit') {
      setInputMessage(selectedMessage.content);
    }
  }, [selectedMessage]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    void trackEvent(AnalyticsEvent.ChatMessagesRefreshed, {
      chatId,
    });
    await chatStore.fetchChatMessages(chatId);
    if (!chatStore.isGroupChat && chatStore.opponentId) {
      await chatStore.getLastReadedMessage({ chatId, userId: chatStore.opponentId });
    }
    setRefreshing(false);
  }, [chatId, chatStore]);

  /** onSubmit(images?) → bool for <InputMessage/> */
  const handleSubmitFromInput = useCallback(
    async (images?: ImageAsset[]) => {
      try {
        const isEdit = selectedMessage?.actionType === 'edit';
        const currentInput = inputMessage;

        // Clear the input immediately to keep the UI responsive.
        setInputMessage('');

        if (isEdit && selectedMessage?._id) {
          await chatStore.editMessage(selectedMessage._id, currentInput);
          void trackEvent(AnalyticsEvent.ChatMessageEdited, {
            chatId,
            messageId: selectedMessage._id,
            hasText: Boolean(currentInput.trim()),
          });
        } else {
          const replyId = selectedMessage?.actionType === 'reply' ? selectedMessage._id : undefined;

          const expoLike = (images ?? []).map(img => ({
            uri: img.uri,
            width: img.width ?? 0,
            height: img.height ?? 0,
          })) as ImagePicker.ImagePickerAsset[];

          const { context, warnings } = await resolveMessageContextForCategories(
            botCategories,
          );
          if (warnings.includes('partnerNatalChartMissing')) {
            uiStore.showSnackbar(
              t('screens.chats.messages.partnerNatalChartMissing'),
              'warning',
            );
          }

          await chatStore.sendMessage(
            currentInput,
            chatId,
            replyId,
            expoLike,
            context ?? undefined,
            i18n.resolvedLanguage ?? i18n.language,
          );
          void trackEvent(AnalyticsEvent.ChatMessageSent, {
            chatId,
            replyToId: replyId,
            hasText: Boolean(currentInput.trim()),
            imagesCount: images?.length ?? 0,
            hasNatalChart: Boolean(context?.natalChart || context?.relationshipCharts?.length),
          });
        }

        setSelectedMessage(null);
        return true;
      } catch {
        return false;
      }
    },
    [
      chatId,
      chatStore,
      botCategories,
      i18n.language,
      i18n.resolvedLanguage,
      inputMessage,
      selectedMessage,
      t,
      uiStore,
    ]
  );

  const handleTypingStart = useCallback(() => {
    void trackEvent(AnalyticsEvent.ChatTypingStarted, { chatId });
    onlineStore.emitTyping(chatId);
  }, [onlineStore, chatId]);

  const handleTypingStop = useCallback(() => {
    void trackEvent(AnalyticsEvent.ChatTypingStopped, { chatId });
    onlineStore.emitStopTyping(chatId);
  }, [onlineStore, chatId]);

  const handlePinnedMessagePress = useCallback(
    (messageId: string) => {
      void trackEvent(AnalyticsEvent.ChatPinnedMessageOpened, {
        chatId,
        messageId,
      });
      const index = groupedMessages.findIndex(m => m._id === messageId);
      if (index !== -1 && flatListRef.current) {
        try {
          flatListRef.current.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
        } catch (e) {
          console.warn(
            t('components.chat.messages.debug.scrollToPinnedFailed'),
            e,
          );
        }
      }
    },
    [groupedMessages, t]
  );

  const handleUnpinMessage = useCallback(
    (messageId: string) => {
      chatStore.unpinMessage(messageId);
      void trackEvent(AnalyticsEvent.ChatMessageUnpinned, {
        chatId,
        messageId,
      });
    },
    [chatId, chatStore]
  );

  const handleDownloadImage = useCallback(async (url: string) => {
    await saveImageToPhotos(url);
  }, []);

  const handleShareImage = useCallback(async (url: string) => {
    await shareImageFromUrl(url);
  }, []);

  const pinnedMessages = chatStore.pinnedMessages;
  const hasPinnedMessages = pinnedMessages.length > 0;

  const actions = {
    reportSelected: () => {
      if (!selectedMessage) return;
      chatStore.reportMessage(selectedMessage._id);
      uiStore.showSnackbar(
        t('components.chat.messages.snackbar.reportSent'),
        'success',
      );
      void trackEvent(AnalyticsEvent.ChatMessageReported, {
        chatId,
        messageId: selectedMessage._id,
      });
      setSelectedMessage(null);
      toggleMode();
    },
    deleteSelected: async () => {
      if (!selectedMessage) return;
      try {
        await chatStore.deleteMessage(selectedMessage._id);
        uiStore.showSnackbar(
          t('components.chat.messages.snackbar.messageDeleted'),
          'success',
        );
        void trackEvent(AnalyticsEvent.ChatMessageDeleted, {
          chatId,
          messageId: selectedMessage._id,
        });
      } catch (error) {
        console.error(
          t('components.chat.messages.debug.deleteMessageFailed'),
          error,
        );
        uiStore.showSnackbar(
          t('components.chat.messages.snackbar.deleteMessageFailed'),
          'error',
        );
      } finally {
        setSelectedMessage(null);
        setEditMode(false);
      }
    },
    copySelected: async () => {
      if (!selectedMessage?.content) return;
      await Clipboard.setStringAsync(selectedMessage.content);
      setSelectedMessage(null);
      uiStore.showSnackbar(
        t('components.chat.messages.snackbar.copied'),
        'success',
      );
      void trackEvent(AnalyticsEvent.ChatMessageCopied, {
        chatId,
        messageId: selectedMessage._id,
      });
      toggleMode();
    },
    togglePinSelected: () => {
      if (!selectedMessage) return;
      const isPinned = chatStore.isMessagePinned(selectedMessage._id);
      if (isPinned) {
        chatStore.unpinMessage(selectedMessage._id);
        void trackEvent(AnalyticsEvent.ChatMessageUnpinned, {
          chatId,
          messageId: selectedMessage._id,
        });
      } else {
        chatStore.pinMessage(selectedMessage);
        void trackEvent(AnalyticsEvent.ChatMessagePinned, {
          chatId,
          messageId: selectedMessage._id,
        });
      }
      setSelectedMessage(null);
      toggleMode();
    },
    startEditSelected: () => {
      if (selectedMessage?.sender?._id === myId) {
        setSelectedMessage({ ...selectedMessage, actionType: 'edit' });
        toggleMode();
      }
    },
    setReplyMode: () => {
      if (!selectedMessage) return;
      setSelectedMessage({ ...selectedMessage, actionType: 'reply' });
      void trackEvent(AnalyticsEvent.ChatMessageReplyStarted, {
        chatId,
        messageId: selectedMessage._id,
      });
      toggleMode();
    },
    clearSelected: () => setSelectedMessage(null),
    clearChatHistory: async () => {
      try {
        await chatStore.clearChatHistory(chatId);
        setSkip(0);
        uiStore.showSnackbar(
          t('components.chat.messages.snackbar.historyCleared'),
          'success',
        );
        void trackEvent(AnalyticsEvent.ChatHistoryCleared, {
          chatId,
        });
      } catch (error) {
        console.error(
          t('components.chat.messages.debug.clearHistoryFailed'),
          error,
        );
        uiStore.showSnackbar(
          t('components.chat.messages.snackbar.clearHistoryFailed'),
          'error',
        );
      }
    },
  };

  return {
    // refs
    flatListRef,

    // flags
    isLoading,
    refreshing,
    editMode,
    isGroupChat,
    hasPinnedMessages,

    // ids
    myId: myId!,
    chatId,
    lastReadMessageIdOpponent,

    // data
    users,
    chatTitle,
    chatImg,
    groupedMessages,
    pinnedMessages,
    selectedMessage,
    inputMessage,

    // setters
    setInputMessage,
    setSelectedMessage,

    // handlers
    onRefresh,
    loadMoreMessages,
    handleSubmitFromInput,
    handleTypingStart,
    handleTypingStop,
    handlePinnedMessagePress,
    handleUnpinMessage,
    handleDownloadImage,
    handleShareImage,
    toggleMode,
    exitEditMode,
    pickImages,
    actions,
  };
}
