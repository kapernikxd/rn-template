import React, { FC, useEffect, useRef } from 'react';
import { Animated, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { observer } from 'mobx-react-lite';
import { EmptyState, Spacer, ChatItem } from 'rn-vs-lb';
import { ThemeType, useTheme } from 'rn-vs-lb/theme';
import { useTranslation } from 'react-i18next';

import { SearchInput } from '../../components/form';
import { SwipeableChatItem } from '../../components/chat/SwipeableChatItem';
import { usePortalNavigation } from '../../helpers/hooks';
import { getUserAvatar, getUserFullName } from '../../helpers/utils/user';
import { getCompanionUser } from '../../helpers/utils/chat';
import { getSmartTime } from '../../helpers/utils/date';
import { useRootStore } from '../../store/StoreProvider';
import type { UserDTO } from '../../types';
import { ChatTab, useChats } from '../../helpers/hooks/Chats/useChats';
import { useSafeAreaColors } from '../../store/SafeAreaColorProvider';
import { ROUTES } from '../../navigation';
import { useChatNatalChartRequirement } from '../../helpers/hooks/Chats/useChatNatalChartRequirement';
import { NatalChartRequiredModal } from '../../components/chat/NatalChartRequiredModal';
import { AnalyticsEvent, trackEvent } from '../../services/analytics/events';
import { ChatListItem } from '../../types/chat';

export const ChatsScreen: FC = observer(() => {
  const { theme, isDark } = useTheme();
  const { setColors } = useSafeAreaColors();
  const styles = getStyles({ theme });
  const { t } = useTranslation();

  const { goToChatMessages, goToMain } = usePortalNavigation();
  const { authStore, onlineStore } = useRootStore();

  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    isRefreshing,
    chats,
    handleLoadMore,
    handleRefresh,
    handleDeleteChat,
  } = useChats();

  const scrollY = useRef(new Animated.Value(0)).current;

  const { isCheckingNatalChart, isNatalChartModalVisible } = useChatNatalChartRequirement();

  useEffect(() => {
    setColors({
      topColor: theme.background,
      bottomColor: theme.white,
    });
  }, [theme, setColors]);

  useEffect(() => {
    void trackEvent(AnalyticsEvent.ChatsScreenViewed, {
      tab: activeTab,
    });
  }, [activeTab]);

  useEffect(() => {
    void trackEvent(AnalyticsEvent.ChatsTabChanged, {
      tab: activeTab,
    });
  }, [activeTab]);

  const handleOpenChat = (chat: ChatListItem) => {
    const chatType = chat.isBotChat ? 'bot' : chat.isGroupChat ? 'group' : 'private';
    void trackEvent(AnalyticsEvent.ChatOpened, {
      chatId: chat._id,
      chatType,
      sourceTab: activeTab,
    });

    goToChatMessages({
      chatId: chat._id,
    });
  };

  const renderPrivateItem = ({ item }: { item: ChatListItem }) => {
    const user = getCompanionUser(item, authStore.getMyId());
    const isUserOnline = onlineStore.onlineUsers?.some(u => u.userId === user?._id) ?? false;

    return (
      <SwipeableChatItem
        onDelete={() => handleDeleteChat(item)}
        actionBackgroundColor={theme.danger}
        iconColor={theme.white}
      >
        <ChatItem
          unread={item?.unread?.count > 0 ? String(item?.unread?.count) : undefined}
          onPress={() => handleOpenChat(item)}
          variant="person"
          imgUrl={getUserAvatar(user as UserDTO)}
          senderFullName={getUserFullName(user as UserDTO)}
          isUserOnline={isUserOnline}
          createdAt={getSmartTime(item?.latestMessage?.createdAt)}
          lastMessage={item?.latestMessage?.content}
        />
      </SwipeableChatItem>
    );
  };

  const renderGroupItem = ({ item }: { item: ChatListItem }) => (
    <SwipeableChatItem
      onDelete={() => handleDeleteChat(item)}
      actionBackgroundColor={theme.danger}
      iconColor={theme.white}
    >
      <ChatItem
        unread={item?.unread?.count > 0 ? String(item?.unread?.count) : undefined}
        onPress={() => handleOpenChat(item)}
        variant="group"
        chatName={item?.title ?? t('screens.chats.fallbacks.group')}
        createdAt={getSmartTime(item?.latestMessage?.createdAt)}
        lastMessage={item?.latestMessage?.content}
        imgUrl={item?.avatarUrl ?? ''}
      />
    </SwipeableChatItem>
  );

  const renderBotItem = ({ item }: { item: ChatListItem }) => (
    <SwipeableChatItem
      onDelete={() => handleDeleteChat(item)}
      actionBackgroundColor={theme.danger}
      iconColor={theme.white}
    >
      <ChatItem
        unread={item?.unread?.count > 0 ? String(item?.unread?.count) : undefined}
        onPress={() => handleOpenChat(item)}
        variant="bot"
        chatName={item?.title ?? t('screens.chats.fallbacks.bot')}
        createdAt={getSmartTime(item?.latestMessage?.createdAt)}
        lastMessage={item?.latestMessage?.content}
      />
    </SwipeableChatItem>
  );

  const renderItem =
    activeTab === ChatTab.Person ? renderPrivateItem : activeTab === ChatTab.Group ? renderGroupItem : renderBotItem;

  return (
    <View style={styles.container}>
      <NatalChartRequiredModal
        visible={!isCheckingNatalChart && isNatalChartModalVisible}
        onAction={() => goToMain(ROUTES.LibraryTab)}
      />

      <Spacer />

      {/* здесь можно добавить TabSwitcher, который дергает setActiveTab */}

      <View style={styles.searchContainer}>
        <SearchInput
          iconType="search"
          placeholder={t('screens.chats.searchPlaceholder')}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={chats}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListEmptyComponent={<EmptyState />}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.2}
        removeClippedSubviews
        initialNumToRender={20}
        windowSize={7}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
      />
    </View>
  );
});

const getStyles = ({ theme }: { theme: ThemeType }) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    background: {
      flex: 1,
      resizeMode: 'cover',
    },
    searchContainer: {
      paddingHorizontal: 10,
      marginBottom: 8,
    },
  });
