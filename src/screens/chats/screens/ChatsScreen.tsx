import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  ImageBackground,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { observer } from 'mobx-react-lite';
import { EmptyState, Spacer, Dot, ChatItem } from 'rn-vs-lb';
import { GlobalStyleSheetType, ThemeType, useTheme } from 'rn-vs-lb/theme';
import { useFocusEffect } from '@react-navigation/native';
import { useRootStore } from '../../../store/StoreProvider';
import { SearchInput } from '../../../components/form';
import { usePortalNavigation } from '../../../helpers/hooks';
import { CHAT_LIMIT } from '../../../constants';
import { FetchChatsOptions } from '../../../types/chat';
import { getUserAvatar, getUserFullName } from '../../../helpers/utils/user';
import { getCompanionUser } from '../../../helpers/utils/chat';
import { UserDTO } from '../../../types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getSmartTime } from '../../../helpers/utils/date';

// const chatBackground = require('../../assets/images/chat-background.png')

enum ChatTab {
  Person = 'person',
  Group = 'group',
  Bot = 'bot'
}

enum BotSubTab {
  My = 'my',
  Others = 'others'
}

export const ChatsScreen: FC = observer(() => {
  const { globalStyleSheet, theme } = useTheme();
  const styles = getStyles({ globalStyleSheet, theme });
  const { chatStore, authStore, onlineStore } = useRootStore();
  const { goToChatMessages } = usePortalNavigation();

  const [chatIds, setChatIds] = useState<string[]>([])

  const [activeTab, setActiveTab] = useState<ChatTab>(ChatTab.Person);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const scrollY = useRef(new Animated.Value(0)).current;
  const [isRefreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState<number>(1);

  const loadChats = async (
    tab: ChatTab = activeTab,
    newPage: number = page,
    query: string = searchQuery
  ) => {
    const options: FetchChatsOptions = {
      typeChat:
        tab === ChatTab.Person
          ? 'private'
          : tab === ChatTab.Group
            ? 'group'
            : 'bot',
      limit: CHAT_LIMIT,
      page: newPage,
      ...(query ? { search: query } : {}),
    };
    const ids = await chatStore.fetchChats(options);
    setChatIds(prev => (newPage > 1 ? [...prev, ...ids] : ids));
  };

  const handleLoadMore = () => {
    if (chatStore.hasMoreChats && !chatStore.isLoadingChats) {
      const nextPage = page + 1;
      setPage(nextPage);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await loadChats(activeTab, 1, searchQuery);
    setRefreshing(false);
  };

  useEffect(() => {
    loadChats(activeTab, page, searchQuery);
  }, [activeTab, page]);

  useFocusEffect(
    useCallback(() => {
      onlineStore.setUserNewMessage(false);
      if (activeTab === ChatTab.Person) {
        onlineStore.setHasUnreadPrivate(false);
      } else if (activeTab === ChatTab.Group) {
        onlineStore.setHasUnreadGroup(false);
      } else if (activeTab === ChatTab.Bot) {
        onlineStore.setHasUnreadBot(false);
      }
    }, [activeTab])
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      loadChats(activeTab, 1, searchQuery);
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);


  useFocusEffect(
    useCallback(() => {
      if (authStore.isAuth) {
        chatStore.subscribeToChats();
        if (chatIds.length > 0) {
          console.log('onlineStore.emitJoinChats!!!', chatIds)
          onlineStore.emitJoinChats(chatIds)
        }
      }

      return () => {
        chatStore.cleanMessages();
        // chatStore.unsubscribeFromChats();
      };
    }, [chatIds])
  );

  const renderPrivateItem = ({ item }: { item: any }) => {
    const user = getCompanionUser(item, authStore.getMyId());
    const isUserOnline = () => onlineStore.onlineUsers?.some(onlineUser => onlineUser.userId === user?._id);
    return (
      <ChatItem
        unread={item?.unread?.count > 0 ? item?.unread?.count?.toString() : undefined}
        onPress={() => goToChatMessages(item._id)}
        variant='person'
        imgUrl={getUserAvatar(user as UserDTO)}
        senderFullName={getUserFullName(user as UserDTO)}
        isUserOnline={isUserOnline()}
        createdAt={getSmartTime(item?.latestMessage?.createdAt)}
        lastMessage={item.latestMessage.content}
      />)
  };
  const renderGroupItem = ({ item }: { item: any }) => (
    <ChatItem
      unread={item?.unread?.count > 0 ? item?.unread?.count?.toString() : undefined}
      onPress={() => goToChatMessages(item._id)}
      variant='group'
      chatName='string'
      createdAt={'today'}
      lastMessage={'hello'}
      imgUrl={''}
    />
  );
  const renderBotItem = ({ item }: { item: any }) => (
    <ChatItem
      unread={item?.unread?.count > 0 ? item?.unread?.count?.toString() : undefined}
      onPress={() => goToChatMessages(item._id)}
      variant='bot'
      chatName='string'
      createdAt={getSmartTime(item?.latestMessage?.createdAt)}
      lastMessage={item.latestMessage.content}
    />
  );

  // Фильтрация списков
  const chatsByTab =
    activeTab === ChatTab.Person
      ? chatStore.privateChats
      : activeTab === ChatTab.Group
        ? chatStore.groupChats
        : chatStore.botChats;

  let filteredChats = chatsByTab;

  const renderItem =
    activeTab === ChatTab.Person
      ? renderPrivateItem
      : activeTab === ChatTab.Group
        ? renderGroupItem
        : renderBotItem;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={styles.container}>
        <View style={{ backgroundColor: theme.background, flex: 1 }} >
          <Spacer />

          {/* Поле поиска */}
          <View style={styles.searchContainer}>
            <SearchInput
              iconType="search"
              placeholder="Search..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Список чатов */}
          <FlatList
            data={filteredChats}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            ListEmptyComponent={<EmptyState />}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.1}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                colors={[theme.primary]} // Android
                tintColor={theme.primary} // iOS
              />
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
});

const getStyles = ({ globalStyleSheet, theme }: { theme: ThemeType, globalStyleSheet: GlobalStyleSheetType }) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.white,
  },
  tabButton: {
    ...globalStyleSheet.flexRowCenterCenter,
    paddingHorizontal: 30,
    height: 58,
    position: 'relative',
  },
  activeTabBorder: {
    borderBottomWidth: 2,
    borderBottomColor: theme.primary,
  },
  tabText: {
    marginLeft: 5,
  },
  activeTabText: {
    color: theme.primary,
    fontWeight: 'bold',
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
