import React, { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme, type ThemeType } from 'rn-vs-lb/theme';

import { ChatItem, type ChatItemProps } from 'rn-vs-lb/components/Chat/ChatItem';
import { getUserAvatar, getUserFullName } from '../../../helpers/utils/user';
import { ROUTES, type ChatsNav } from '../../../navigation/types';
import { ChatTab, BotSubTab, useChatScreen } from '../logic/useChatScreen';
import { BASE_URL } from '../../../constants/links';

const TAB_LABELS: Record<ChatTab, string> = {
  [ChatTab.Person]: 'Личные',
  [ChatTab.Group]: 'Группы',
  [ChatTab.Bot]: 'Боты',
};

const BOT_TAB_LABELS: Record<BotSubTab, string> = {
  [BotSubTab.My]: 'Мои',
  [BotSubTab.Others]: 'Каталог',
};

const ensureAbsoluteUri = (value?: string | null) => {
  if (!value) return undefined;
  if (typeof value !== 'string') return undefined;
  if (/^https?:/i.test(value)) return value;
  const sanitized = value.replace(/^\/+/, '');
  if (sanitized.startsWith('images/')) {
    return `${BASE_URL}${sanitized}`;
  }
  return `${BASE_URL}images/${sanitized}`;
};

const pickImageFromValue = (value: any): string | undefined => {
  if (!value) return undefined;
  if (typeof value === 'string') return ensureAbsoluteUri(value);
  if (typeof value === 'object') {
    return (
      ensureAbsoluteUri(value.path || value.fileId || value.avatarFile || value.url || value.uri) ||
      (Array.isArray(value) ? pickImageFromValue(value[0]) : undefined)
    );
  }
  return undefined;
};

const extractUserId = (user: any): string | undefined => {
  if (!user) return undefined;
  if (typeof user === 'string') return user;
  return user._id || user.id || user.userId;
};

const extractUnread = (unread: any): number | string | null => {
  if (unread === null || unread === undefined) return null;
  if (typeof unread === 'number' || typeof unread === 'string') return unread;
  if (typeof unread === 'boolean') return unread ? 1 : null;
  if (typeof unread === 'object') {
    const value = unread.count ?? unread.total ?? unread.unreadCount ?? unread.value;
    if (typeof value === 'number' || typeof value === 'string') {
      return value;
    }
  }
  return null;
};

const extractMessageContent = (message: any): string | undefined => {
  if (!message || typeof message !== 'object') return undefined;
  return message.content ?? message.text ?? message.message ?? undefined;
};

const extractSenderId = (message: any): string | undefined => {
  if (!message || typeof message !== 'object') return undefined;
  const { sender } = message;
  if (typeof sender === 'string') return sender;
  if (sender && typeof sender === 'object') {
    return sender._id ?? sender.id ?? sender.userId;
  }
  return message.senderId ?? message.authorId ?? message.userId;
};

const extractSenderName = (message: any): string | undefined => {
  if (!message || typeof message !== 'object') return undefined;
  const direct =
    message.senderFullName ??
    message.sender_full_name ??
    message.senderName ??
    message.authorName;
  if (typeof direct === 'string' && direct.trim().length > 0) {
    return direct;
  }
  const { sender } = message;
  if (sender && typeof sender === 'object') {
    if (typeof sender.fullName === 'string') return sender.fullName;
    const fromHelper = getUserFullName(sender as any);
    if (fromHelper.trim().length > 0) return fromHelper;
    const first = sender.name ?? sender.firstName ?? sender.firstname;
    const last = sender.lastname ?? sender.lastName ?? sender.surname;
    const username = sender.username ?? sender.userName;
    return [first, last].filter(Boolean).join(' ').trim() || username || sender.email;
  }
  return undefined;
};

const formatTimestamp = (createdAt?: string): string | undefined => {
  if (!createdAt) return undefined;
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return undefined;
  const diff = Date.now() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < 0) return date.toLocaleDateString();
  if (diff < minute) return 'now';
  if (diff < hour) return `${Math.floor(diff / minute)}m`;
  if (diff < day) return `${Math.floor(diff / hour)}h`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}d`;
  return date.toLocaleDateString();
};

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
      gap: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.title,
    },
    subtitle: {
      fontSize: 14,
      color: theme.text,
    },
    searchInput: {
      height: 44,
      paddingHorizontal: 14,
      borderRadius: 12,
      backgroundColor: theme.input,
      color: theme.text,
    },
    tabs: {
      flexDirection: 'row',
      gap: 8,
    },
    tabButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: theme.backgroundSecond,
    },
    tabButtonActive: {
      backgroundColor: theme.primary,
    },
    tabButtonText: {
      color: theme.text,
      fontWeight: '500',
    },
    tabButtonTextActive: {
      color: theme.white,
    },
    botTabs: {
      flexDirection: 'row',
      gap: 8,
    },
    listContent: {
      paddingBottom: 24,
    },
    separator: {
      height: 4,
    },
    footer: {
      paddingVertical: 16,
    },
    emptyState: {
      padding: 40,
      alignItems: 'center',
      gap: 8,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.title,
    },
    emptySubtitle: {
      fontSize: 14,
      color: theme.text,
      textAlign: 'center',
    },
  });

export const ChatsScreen = () => {
  const navigation = useNavigation<ChatsNav>();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const {
    activeTab,
    activeBotTab,
    searchQuery,
    setSearchQuery,
    setActiveBotTab,
    handlePressTab,
    handleRefresh,
    handleLoadMore,
    isRefreshing,
    chats,
    isLoadingChats,
    hasMoreChats,
    myId,
    getIsUserOnline,
  } = useChatScreen();

  const handleOpenChat = useCallback(
    (chatId: string, title: string) => {
      navigation.navigate(ROUTES.ChatMessages, {
        chatId,
        title,
      });
    },
    [navigation],
  );

  const resolveUserDisplayName = useCallback((user: any) => {
    if (!user) return '';
    if (typeof user === 'string') return user;
    if (typeof user.fullName === 'string' && user.fullName.trim().length > 0) {
      return user.fullName;
    }
    const fullName = getUserFullName(user as any).trim();
    if (fullName.length > 0) return fullName;
    const first = user.name ?? user.firstName ?? user.firstname;
    const last = user.lastname ?? user.lastName ?? user.surname;
    const combined = [first, last].filter(Boolean).join(' ').trim();
    if (combined.length > 0) return combined;
    return user.username ?? user.userName ?? user.email ?? '';
  }, []);

  const resolveUserAvatar = useCallback((user: any): string | undefined => {
    if (!user || typeof user === 'string') return undefined;
    const direct =
      ensureAbsoluteUri(user.avatarFile) ||
      ensureAbsoluteUri(user.avatar) ||
      ensureAbsoluteUri(user.avatarUrl) ||
      pickImageFromValue(user.avatarImage);
    if (direct) return direct;
    return getUserAvatar(user as any);
  }, []);

  const resolveGroupAvatar = useCallback((chat: any): string | undefined => {
    return (
      ensureAbsoluteUri(chat.chatAvatar) ||
      ensureAbsoluteUri(chat.avatar) ||
      ensureAbsoluteUri(chat.avatarFile) ||
      pickImageFromValue(chat.image) ||
      pickImageFromValue(chat.images) ||
      pickImageFromValue(chat.chatImage) ||
      pickImageFromValue(chat.post?.coverImage) ||
      pickImageFromValue(chat.post?.image) ||
      pickImageFromValue(chat.post?.images)
    );
  }, []);

  const mapChatToProps = useCallback(
    (chat: any): ChatItemProps => {
      const latestMessage =
        chat && typeof chat.latestMessage === 'object' ? chat.latestMessage : undefined;
      const messageText = extractMessageContent(latestMessage);
      const createdAt = formatTimestamp(latestMessage?.createdAt ?? chat.updatedAt);
      const unread = extractUnread(chat.unread);

      if (chat?.isBotChat) {
        const chatName = chat.chatName ?? chat.bot?.name ?? 'Bot';
        return {
          variant: 'bot',
          chatName,
          lastMessage: messageText,
          createdAt,
          unread,
          onPress: () => handleOpenChat(chat._id, chatName),
        };
      }

      if (chat?.isGroupChat) {
        const chatName =
          chat.chatName ??
          chat.post?.title ??
          chat.post?.name ??
          chat.post?.eventName ??
          'Групповой чат';

        const senderId = extractSenderId(latestMessage);
        const senderName = senderId === myId ? 'You' : extractSenderName(latestMessage);

        return {
          variant: 'group',
          chatName,
          senderFullName: senderName,
          lastMessage: messageText,
          createdAt,
          unread,
          imgUrl: resolveGroupAvatar(chat),
          onPress: () => handleOpenChat(chat._id, chatName),
        };
      }

      const users: any[] = Array.isArray(chat?.users) ? chat.users : [];
      const opponent = users.find((user) => extractUserId(user) !== myId);
      const opponentId = extractUserId(opponent);
      const opponentName = resolveUserDisplayName(opponent);
      const chatName = chat.chatName ?? (opponentName || 'Чат');

      const senderId = extractSenderId(latestMessage);
      const senderName = senderId === myId ? 'You' : extractSenderName(latestMessage) ?? opponentName;

      return {
        variant: 'person',
        chatName,
        senderFullName: senderName || chatName,
        lastMessage: messageText,
        createdAt,
        unread,
        imgUrl: resolveUserAvatar(opponent),
        isUserOnline: getIsUserOnline(opponentId),
        onPress: () => handleOpenChat(chat._id, chatName),
      };
    },
    [getIsUserOnline, handleOpenChat, myId, resolveGroupAvatar, resolveUserAvatar, resolveUserDisplayName],
  );

  const renderItem = useCallback(
    ({ item }: { item: any }) => {
      const chatProps = mapChatToProps(item);
      return <ChatItem {...chatProps} />;
    },
    [mapChatToProps],
  );

  const keyExtractor = useCallback((item: any) => item._id ?? item.id ?? String(item), []);

  const showFooterLoader = isLoadingChats && (chats?.length ?? 0) > 0;

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        keyExtractor={keyExtractor}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={(
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Сообщения</Text>
              <Text style={styles.subtitle}>
                Следите за обновлениями и переходите к перепискам в один тап.
              </Text>
            </View>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Поиск"
              placeholderTextColor={theme.placeholder}
              style={styles.searchInput}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.tabs}>
              {Object.values(ChatTab).map((tab) => {
                const isActive = tab === activeTab;
                return (
                  <TouchableOpacity
                    key={tab}
                    onPress={() => handlePressTab(tab)}
                    style={[styles.tabButton, isActive && styles.tabButtonActive]}
                  >
                    <Text
                      style={[
                        styles.tabButtonText,
                        isActive && styles.tabButtonTextActive,
                      ]}
                    >
                      {TAB_LABELS[tab]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {activeTab === ChatTab.Bot ? (
              <View style={styles.botTabs}>
                {Object.values(BotSubTab).map((tab) => {
                  const isActive = tab === activeBotTab;
                  return (
                    <TouchableOpacity
                      key={tab}
                      onPress={() => setActiveBotTab(tab)}
                      style={[styles.tabButton, isActive && styles.tabButtonActive]}
                    >
                      <Text
                        style={[
                          styles.tabButtonText,
                          isActive && styles.tabButtonTextActive,
                        ]}
                      >
                        {BOT_TAB_LABELS[tab]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}
          </View>
        )}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        onEndReachedThreshold={0.2}
        onEndReached={() => {
          if (!isLoadingChats && hasMoreChats) {
            handleLoadMore();
          }
        }}
        ListFooterComponent={showFooterLoader ? (
          <View style={styles.footer}>
            <ActivityIndicator color={theme.primary} />
          </View>
        ) : null}
        ListEmptyComponent={
          !isLoadingChats && (!chats || chats.length === 0) ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Пока пусто</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? 'Мы не нашли чатов по вашему запросу. Попробуйте изменить поисковую фразу.'
                  : 'Начните новое общение или дождитесь новых сообщений.'}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};
