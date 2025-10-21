import React, { FC, useEffect, useRef } from 'react';
import { Animated, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { observer } from 'mobx-react-lite';
import { EmptyState, Spacer, ChatItem } from 'rn-vs-lb';
import { ThemeType, useTheme } from 'rn-vs-lb/theme';

import { SearchInput } from '../../components/form';
import { usePortalNavigation } from '../../helpers/hooks';
import { getUserAvatar, getUserFullName } from '../../helpers/utils/user';
import { getCompanionUser } from '../../helpers/utils/chat';
import { getSmartTime } from '../../helpers/utils/date';
import { useRootStore } from '../../store/StoreProvider';
import type { UserDTO } from '../../types';
import { ChatTab, useChats } from '../../helpers/hooks/Chats/useChats';
import { useSafeAreaColors } from '../../store/SafeAreaColorProvider';

export const ChatsScreen: FC = observer(() => {
  const { theme, isDark } = useTheme();
  const { setColors } = useSafeAreaColors();
  const styles = getStyles({ theme });

  const { goToChatMessages } = usePortalNavigation();
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
  } = useChats();

  const scrollY = useRef(new Animated.Value(0)).current;


  useEffect(() => {
    setColors({
      topColor: theme.background,
      bottomColor: theme.white,
    });
  }, [theme, setColors]);

  const renderPrivateItem = ({ item }: { item: any }) => {
    const user = getCompanionUser(item, authStore.getMyId());
    const isUserOnline = onlineStore.onlineUsers?.some(u => u.userId === user?._id) ?? false;

    return (
      <ChatItem
        unread={item?.unread?.count > 0 ? String(item?.unread?.count) : undefined}
        onPress={() =>
          goToChatMessages({
            chatId: item._id,
          })
        }
        variant="person"
        imgUrl={getUserAvatar(user as UserDTO)}
        senderFullName={getUserFullName(user as UserDTO)}
        isUserOnline={isUserOnline}
        createdAt={getSmartTime(item?.latestMessage?.createdAt)}
        lastMessage={item?.latestMessage?.content}
      />
    );
  };

  const renderGroupItem = ({ item }: { item: any }) => (
    <ChatItem
      unread={item?.unread?.count > 0 ? String(item?.unread?.count) : undefined}
      onPress={() =>
        goToChatMessages({
          chatId: item._id,
        })
      }
      variant="group"
      chatName={item?.title ?? 'Group'}
      createdAt={getSmartTime(item?.latestMessage?.createdAt)}
      lastMessage={item?.latestMessage?.content}
      imgUrl={item?.avatarUrl ?? ''}
    />
  );

  const renderBotItem = ({ item }: { item: any }) => (
    <ChatItem
      unread={item?.unread?.count > 0 ? String(item?.unread?.count) : undefined}
      onPress={() =>
        goToChatMessages({
          chatId: item._id,
        })
      }
      variant="bot"
      chatName={item?.title ?? 'Bot'}
      createdAt={getSmartTime(item?.latestMessage?.createdAt)}
      lastMessage={item?.latestMessage?.content}
    />
  );

  const renderItem =
    activeTab === ChatTab.Person ? renderPrivateItem : activeTab === ChatTab.Group ? renderGroupItem : renderBotItem;

  return (
    <View style={styles.container}>
      <Spacer />

      {/* здесь можно добавить TabSwitcher, который дергает setActiveTab */}

      <View style={styles.searchContainer}>
        <SearchInput
          iconType="search"
          placeholder="Search..."
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
