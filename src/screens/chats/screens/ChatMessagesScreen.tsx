import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import {
  StyleSheet,
  View,
  FlatList,
  Pressable,
  RefreshControl,
  KeyboardAvoidingView,
  Keyboard,
  AppState,
  TouchableOpacity,
  Text,
  ImageBackground,
} from 'react-native';
import { RouteProp, useRoute, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';

import { getUserAvatar, getUserFullName } from '../../../helpers/utils/user';
import { generateMessagesWithDates } from '../../../helpers/utils/date';
import { EmptyState, LoadingScreen, Spacer, PinnedMessagesBar, HeaderWithImg, InputMessage, HeaderEdit, HeaderSwitcher, MessageItem } from 'rn-vs-lb';
import { usePortalNavigation } from '../../../helpers/hooks';
import { ThemeType, useTheme, SizesType, CommonStylesType } from 'rn-vs-lb/theme';
import { useRootStore } from '../../../store/StoreProvider';
import { ChatsStackParamList } from '../../../navigation';
import { MessageDTOExtented, UserDTO } from '../../../types';
import { Linking } from 'react-native';
import { getSmartTime } from '../../../helpers/utils/date';

const chatBackground = require('../../../assets/chat-background.png');

const OFFSET = 30;

type SelectedActionType = 'reply' | 'edit' | 'copy' | 'forward' | 'select';

type MessageDTOWithAction = MessageDTOExtented & {
  actionType?: SelectedActionType;
};

type ChatMessagesScreenRouteProp = RouteProp<ChatsStackParamList, 'ChatMessages'>;

// Минимальный тип для новых вложений, которые ждёт InputMessage
type ImageAsset = { uri: string; width?: number; height?: number; fileName?: string; mimeType?: string };

/** Открыть галерею и вернуть массив ImageAsset под контракт InputMessage */
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

export const ChatMessagesScreen: FC = observer(() => {
  const { theme, sizes, commonStyles, globalStyleSheet, typography } = useTheme();
  const styles = getStyles({ theme, sizes, commonStyles });

  const { chatStore, authStore, uiStore, onlineStore } = useRootStore();
  const { goBack, goToProfile } = usePortalNavigation();

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const route = useRoute<ChatMessagesScreenRouteProp>();
  const chatId = route.params.chatId;
  const myId = authStore.getMyId();

  const flatListRef = useRef<FlatList>(null);
  const [skip, setSkip] = useState(0);

  const [editMode, setEditMode] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<MessageDTOWithAction | null>(null);

  const toggleMode = () => setEditMode(prev => !prev);
  const exitEditMode = () => {
    setEditMode(false);
    setSelectedMessage(null);
  };

  const loadMoreMessages = async () => {
    if (chatStore.messages.length >= skip + OFFSET) {
      setSkip(prev => prev + OFFSET);
      await chatStore.fetchChatMessages(chatId, skip + OFFSET);
    }
  };

  const handleLinkPress = (rawUrl: string) => {
    try {
      const url = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
      Linking.openURL(url);
    } catch {
      // если хочешь всплывашку:
      // uiStore.showSnackbar('Cannot open link', 'error');
    }
  };

  const lastMessage = chatStore.messages[chatStore.messages.length - 1] ?? undefined;

  const [inputMessage, setInputMessage] = useState<string>('');

  const groupedMessages = generateMessagesWithDates(chatStore.messages);

  const user = chatStore?.selectedChat?.users?.find(u => u?._id !== myId) as UserDTO | undefined;
  const users = chatStore?.selectedChat?.users?.filter(u => u?._id !== myId) as UserDTO[] | undefined;

  useEffect(() => {
    if (!chatStore.isGroupChat && chatStore.opponentId) {
      chatStore.getLastReadedMessage({ chatId, userId: chatStore.opponentId });
    }
  }, [chatStore.opponentId]);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const init = async () => {
        setIsLoading(true);

        onlineStore.setCurrentRoutName('chatMessages');

        // Подключаем сокет и входим в комнату
        await onlineStore.ensureConnectedAndJoined([chatId]);

        // Слушатели
        chatStore.subscribeToChat(chatId);

        // Первичная загрузка
        await Promise.all([
          chatStore.fetchChatMessages(chatId),
          chatStore.fetchChat(chatId, myId),
          chatStore.loadPinnedMessages(chatId),
        ]);

        if (isMounted) setIsLoading(false);
      };

      const appStateSub = AppState.addEventListener('change', async (state) => {
        if (state === 'active') {
          await onlineStore.ensureConnectedAndJoined([chatId]);
          chatStore.subscribeToChat(chatId);
          chatStore.fetchChatMessages(chatId);
        }
      });

      init();

      return () => {
        isMounted = false;
        appStateSub.remove();
        onlineStore.setCurrentRoutName('');
        chatStore.unsubscribeFromChat(chatId);
        chatStore.cleanMessages();
        chatStore.cleanOpponentId();
      };
    }, [chatId, myId])
  );

  useEffect(() => {
    const hasId = !!lastMessage?._id;
    const notMine = lastMessage?.sender?._id !== myId;

    if (hasId && notMine) {
      chatStore.markChatAsRead({ chatId, messageId: lastMessage._id });
    }
  }, [lastMessage, chatId]);

  useEffect(() => {
    if (selectedMessage?.actionType === 'edit') {
      setInputMessage(selectedMessage.content ?? '');
    }
  }, [selectedMessage]);

  /** Адаптер под новый onSubmit(images?: ImageAsset[]) => Promise<boolean> */
  const handleSubmitFromInput = async (images?: ImageAsset[]) => {
    try {
      const isEdit = selectedMessage?.actionType === 'edit';

      // очистим поле сразу (как и раньше)
      setInputMessage('');

      if (isEdit && selectedMessage?._id) {
        await chatStore.editMessage(selectedMessage._id, inputMessage);
      } else {
        const replyId = selectedMessage?.actionType === 'reply' ? selectedMessage._id : undefined;

        // если sendMessage ждёт expo-ассеты — конвертируем
        const expoLike = (images ?? []).map(img => ({
          uri: img.uri,
          width: img.width ?? 0,
          height: img.height ?? 0,
        })) as ImagePicker.ImagePickerAsset[];

        await chatStore.sendMessage(inputMessage, chatId, replyId, expoLike);
      }

      setSelectedMessage(null);
      return true;
    } catch {
      return false;
    }
  };

  const renderMessageItem = useCallback(
    ({ item }: { item: MessageDTOExtented }) => {
      // прочитано соперником? (если есть lastReadedMessageId — считаем, что прочитано именно это сообщение)
      const isReadByOpponent =
        !!chatStore?.lastReadedMessage?.lastReadedMessageId &&
        chatStore.lastReadedMessage.lastReadedMessageId === item._id;

      return (
        <MessageItem
          item={item}
          myId={myId}
          isGroupChat={chatStore.isGroupChat}
          isReadByOpponent={isReadByOpponent}
          isSelected={selectedMessage?.actionType === 'select' && selectedMessage._id === item._id}
          onLongPress={() => {
            setSelectedMessage({ ...item, actionType: 'select' });
            toggleMode();
          }}
          // красивое время
          timeText={getSmartTime(item.createdAt)}
          // обработчик линков в тексте
          linkHandler={handleLinkPress}
          // опции превью ссылок (если пока не делаешь — оставь undefined)
          linkPreview={undefined}
          linkPreviewLoading={false}
          // действия над картинкой в полноэкранном модале (необязательно)
          onDownloadImage={undefined}
          onShareImage={undefined}
        />
      );
    },
    [
      myId,
      chatStore.isGroupChat,
      chatStore?.lastReadedMessage?.lastReadedMessageId,
      selectedMessage,
    ]
  );

  const chatTitle = getUserFullName(user!);
  const chatImg = getUserAvatar(user!);
  const onImgPress = () => user?._id && goToProfile(user._id);
  const onActionPress = undefined;

  if (isLoading) {
    return <LoadingScreen />;
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await chatStore.fetchChatMessages(chatId);
    if (!chatStore.isGroupChat && chatStore.opponentId) {
      chatStore.getLastReadedMessage({ chatId, userId: chatStore.opponentId });
    }
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.backgroundThird, height: '100%' }}>
      <KeyboardAvoidingView behavior={'padding'} style={{ flex: 1 }}>
        <View style={styles.container}>
          {/* Header */}
          <HeaderSwitcher
            isFirst={editMode}
            componentA={
              <HeaderEdit
                onClosePress={exitEditMode}
                onReportMessage={() => {
                  if (selectedMessage) {
                    chatStore.reportMessage(selectedMessage._id);
                    uiStore.showSnackbar('The report has been sent', 'success');
                    setSelectedMessage(null);
                    toggleMode();
                  }
                }}
                onCopy={() => {
                  if (selectedMessage?.content) {
                    Clipboard.setStringAsync(selectedMessage.content);
                    setSelectedMessage(null);
                    uiStore.showSnackbar('Copied', 'success');
                    toggleMode();
                  }
                }}
                onEdit={
                  selectedMessage?.sender?._id === myId
                    ? () => {
                      setSelectedMessage({ ...selectedMessage, actionType: 'edit' });
                      toggleMode();
                    }
                    : undefined
                }
                onPinToggle={() => {
                  if (selectedMessage) {
                    if (chatStore.isMessagePinned(selectedMessage._id)) {
                      chatStore.unpinMessage(selectedMessage._id);
                    } else {
                      chatStore.pinMessage(selectedMessage);
                    }
                    setSelectedMessage(null);
                    toggleMode();
                  }
                }}
                isPinned={selectedMessage ? chatStore.isMessagePinned(selectedMessage._id) : false}
              />
            }
            componentB={
              <HeaderWithImg
                users={users}
                isGroupChat={!!chatStore.selectedChat?.isGroupChat}
                onBackPress={goBack}
                onImgPress={onImgPress}
                onActionPress={onActionPress}
                title={chatTitle}
                imgUrl={chatImg}
              />
            }
          />

          {/* Список сообщений */}
          <ImageBackground source={chatBackground} style={styles.background}>
            <FlatList
              keyboardShouldPersistTaps="handled"
              ref={flatListRef}
              data={groupedMessages as any}
              keyExtractor={(item, index) => (item._id ? String(item._id) : `index-${index}`)}
              renderItem={renderMessageItem}
              initialNumToRender={10}
              maxToRenderPerBatch={5}
              removeClippedSubviews
              windowSize={5}
              ListHeaderComponent={
                chatStore.pinnedMessages.length > 0 ? (
                  <PinnedMessagesBar
                    pinnedMessages={chatStore.pinnedMessages}
                    onUnpin={(messageId) => chatStore.unpinMessage(messageId)}
                    onPress={(messageId) => {
                      const index = groupedMessages.findIndex(m => m._id === messageId);
                      if (index !== -1 && flatListRef.current) {
                        flatListRef.current.scrollToIndex({ index, animated: true });
                      }
                    }}
                    isGroupChat={chatStore.isGroupChat}
                    myId={myId}
                    lastReadMessageIdOpponent={chatStore?.lastReadedMessage?.lastReadedMessageId || null}
                  />
                ) : null
              }
              contentContainerStyle={styles.messagesListContent}
              onEndReached={loadMoreMessages}
              refreshControl={
                <RefreshControl
                  onRefresh={onRefresh}
                  refreshing={refreshing}
                  colors={[theme.primary]}
                  tintColor={theme.primary}
                />
              }
              inverted
              onTouchStart={Keyboard.dismiss}
            />
          </ImageBackground>

          {/* Глобальный кликабельный слой при режиме выделения */}
          {editMode && (
            <Pressable onPress={exitEditMode} style={[StyleSheet.absoluteFill, { zIndex: 10 }]} />
          )}

          {editMode && (
            <View style={styles.replyBar}>
              <TouchableOpacity
                onPress={() => {
                  if (selectedMessage) {
                    setSelectedMessage({ ...selectedMessage, actionType: 'reply' });
                    toggleMode();
                  }
                }}
                style={[globalStyleSheet.flexRowCenterStart, { gap: 8 }]}
              >
                <Ionicons name="arrow-undo-outline" size={25} color={theme.text} />
                <Text style={[typography.body, { top: 3 }]}>Reply</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Инпут (новый контракт пропсов) */}
          <View>
            <InputMessage
              value={inputMessage}
              onChange={setInputMessage}
              onSubmit={handleSubmitFromInput}
              replyToMessage={
                selectedMessage?.actionType === 'reply'
                  ? {
                    content: selectedMessage.content ?? '',
                    // при желании можно прокинуть превью изображения:
                    // attachments: selectedMessage.attachments?.map(a => a.url),
                    // images: selectedMessage.images?.map(i => i.url),
                  }
                  : null
              }
              onCancelReply={() => setSelectedMessage(null)}
              editMessage={
                selectedMessage?.actionType === 'edit'
                  ? { content: selectedMessage.content ?? '' }
                  : null
              }
              onCancelEdit={() => {
                setSelectedMessage(null);
                setInputMessage('');
              }}
              maxImages={1}
              onAttachPress={async () => {
                const picked = await pickImages(1);
                return picked;
              }}
              onMaxImagesExceeded={(max) => uiStore.showSnackbar(`Max ${max} images`, 'warning')}
            // Пример событий "печатает"
            // onTyping={() => onlineStore.emitTyping?.(chatId)}
            // onStopTyping={() => onlineStore.emitStopTyping?.(chatId)}
            // Если хочешь контролировать лоадер отправки извне:
            // sendingControlled
            // isSending={chatStore.isSendingMessage}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
});

const getStyles = ({ theme, sizes, commonStyles }: { theme: ThemeType; sizes: SizesType; commonStyles: CommonStylesType }) =>
  StyleSheet.create({
    background: {
      flex: 1,
      resizeMode: 'cover',
    },
    container: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    messagesList: {
      flex: 1,
      borderTopLeftRadius: 40,
      borderTopRightRadius: 40,
      paddingHorizontal: 12,
      backgroundColor: theme.white,
    },
    messagesListContent: {
      paddingTop: 8,
      paddingBottom: 12,
    },
    pinnedContainer: {
      paddingBottom: 8,
    },
    pinnedItem: {
      marginBottom: 6,
    },
    unpinButton: {
      position: 'absolute',
      top: 4,
      right: 4,
    },
    replyBar: {
      ...commonStyles.backgroundLight,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: sizes.sm,
      paddingHorizontal: sizes.sm,
      borderTopColor: theme.border,
      borderTopWidth: 1,
      position: 'absolute',
      left: 0,
      bottom: 0,
      width: '100%',
      zIndex: 20,
    },
  });

export default ChatMessagesScreen;
