import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, FlatList } from 'react-native';
import { useFocusEffect, useRoute, type RouteProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';

import { useRootStore } from '../../../store/StoreProvider';
import { generateMessagesWithDates } from '../../../helpers/utils/date';
import { getUserAvatar, getUserFullName } from '../../../helpers/utils/user';
import { saveImageToPhotos, shareImageFromUrl } from '../../utils/media';

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

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [skip, setSkip] = useState(0);

  const myId = authStore.getMyId();
  const flatListRef = useRef<FlatList>(null);

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
      await chatStore.fetchChatMessages(chatId, next);
    }
  }, [chatId, skip, chatStore]);

  const lastMessage = chatStore.messages[chatStore.messages.length - 1] ?? undefined;

  const [inputMessage, setInputMessage] = useState<string>('');
  const groupedMessages = generateMessagesWithDates(chatStore.messages.slice());

  const user = chatStore?.selectedChat?.users?.find(u => u?._id !== myId);
  const users = chatStore?.selectedChat?.users?.filter(u => u?._id !== myId) ?? [];
  const lastReadMessageIdOpponent = chatStore?.lastReadedMessage?.lastReadedMessageId || null;

  const chatTitle = getUserFullName(user!) ?? 'Private Chat';
  const chatImg = getUserAvatar(user!);
  const isGroupChat = chatStore.isGroupChat;

  // первичная и рефокус-инициализация
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

  // автопрочтение входящего последнего сообщения
  useEffect(() => {
    const hasId = !!lastMessage?._id;
    const notMine = lastMessage?.sender?._id !== myId;
    if (hasId && notMine) {
      chatStore.markChatAsRead({ chatId, messageId: lastMessage._id });
    }
  }, [lastMessage, chatId, myId, chatStore]);

  // подстановка текста при входе в режим редактирования
  useEffect(() => {
    if (selectedMessage?.actionType === 'edit') {
      setInputMessage(selectedMessage.content);
    }
  }, [selectedMessage]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await chatStore.fetchChatMessages(chatId);
    if (!chatStore.isGroupChat && chatStore.opponentId) {
      await chatStore.getLastReadedMessage({ chatId, userId: chatStore.opponentId });
    }
    setRefreshing(false);
  }, [chatId, chatStore]);

  /** onSubmit(images?) → bool для <InputMessage/> */
  const handleSubmitFromInput = useCallback(
    async (images?: ImageAsset[]) => {
      try {
        const isEdit = selectedMessage?.actionType === 'edit';
        const currentInput = inputMessage;

        // очистить поле сразу
        setInputMessage('');

        if (isEdit && selectedMessage?._id) {
          await chatStore.editMessage(selectedMessage._id, currentInput);
        } else {
          const replyId = selectedMessage?.actionType === 'reply' ? selectedMessage._id : undefined;

          const expoLike = (images ?? []).map(img => ({
            uri: img.uri,
            width: img.width ?? 0,
            height: img.height ?? 0,
          })) as ImagePicker.ImagePickerAsset[];

          await chatStore.sendMessage(currentInput, chatId, replyId, expoLike);
        }

        setSelectedMessage(null);
        return true;
      } catch {
        return false;
      }
    },
    [chatId, chatStore, inputMessage, selectedMessage]
  );

  const handleTypingStart = useCallback(() => {
    onlineStore.emitTyping(chatId);
  }, [onlineStore, chatId]);

  const handleTypingStop = useCallback(() => {
    onlineStore.emitStopTyping(chatId);
  }, [onlineStore, chatId]);

  const handlePinnedMessagePress = useCallback(
    (messageId: string) => {
      const index = groupedMessages.findIndex(m => m._id === messageId);
      if (index !== -1 && flatListRef.current) {
        try {
          flatListRef.current.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
        } catch (e) {
          console.warn('Failed to scroll to pinned message', e);
        }
      }
    },
    [groupedMessages]
  );

  const handleUnpinMessage = useCallback(
    (messageId: string) => {
      chatStore.unpinMessage(messageId);
    },
    [chatStore]
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
      uiStore.showSnackbar('The report has been sent', 'success');
      setSelectedMessage(null);
      toggleMode();
    },
    deleteSelected: async () => {
      if (!selectedMessage) return;
      try {
        await chatStore.deleteMessage(selectedMessage._id);
        uiStore.showSnackbar('Message deleted', 'success');
      } catch (error) {
        console.error('Failed to delete message', error);
        uiStore.showSnackbar('Failed to delete message', 'error');
      } finally {
        setSelectedMessage(null);
        setEditMode(false);
      }
    },
    copySelected: async () => {
      if (!selectedMessage?.content) return;
      await Clipboard.setStringAsync(selectedMessage.content);
      setSelectedMessage(null);
      uiStore.showSnackbar('Copied', 'success');
      toggleMode();
    },
    togglePinSelected: () => {
      if (!selectedMessage) return;
      if (chatStore.isMessagePinned(selectedMessage._id)) {
        chatStore.unpinMessage(selectedMessage._id);
      } else {
        chatStore.pinMessage(selectedMessage);
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
      toggleMode();
    },
    clearSelected: () => setSelectedMessage(null),
    clearChatHistory: async () => {
      try {
        await chatStore.clearChatHistory(chatId);
        setSkip(0);
        uiStore.showSnackbar('Chat history cleared', 'success');
      } catch (error) {
        console.error('Failed to clear chat history', error);
        uiStore.showSnackbar('Failed to clear chat history', 'error');
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
