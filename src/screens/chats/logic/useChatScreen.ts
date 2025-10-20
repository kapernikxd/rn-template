// screens/Chat/useChatScreen.ts
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { CHAT_LIMIT } from '../../../constants';
import { useRootStore, useStoreData } from '../../../store/StoreProvider';
import { FetchChatsOptions } from '../../../types/chat';

export enum ChatTab {
  Person = 'person',
  Group = 'group',
  Bot = 'bot',
}

export enum BotSubTab {
  My = 'my',
  Others = 'others',
}

export function useChatScreen() {
  const { chatStore, authStore, onlineStore } = useRootStore();

  // UI/листинг
  const [activeTab, setActiveTab] = useState<ChatTab>(ChatTab.Person);
  const [activeBotTab, setActiveBotTab] = useState<BotSubTab>(BotSubTab.My);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [isRefreshing, setRefreshing] = useState(false);
  const [chatIds, setChatIds] = useState<string[]>([]);
  const scrollY = useRef(new Animated.Value(0)).current;

  const privateChats = useStoreData(chatStore, store => store.privateChats);
  const groupChats = useStoreData(chatStore, store => store.groupChats);
  const botChats = useStoreData(chatStore, store => store.botChats);
  const isLoadingChats = useStoreData(chatStore, store => store.isLoadingChats);
  const hasMoreChats = useStoreData(chatStore, store => store.hasMoreChats);
  const onlineUsers = useStoreData(onlineStore, store => store.onlineUsers);

  const loadChats = useCallback(
    async (tab: ChatTab = activeTab, newPage: number = page, query: string = searchQuery) => {
      const options: FetchChatsOptions = {
        typeChat: tab === ChatTab.Person ? 'private' : tab === ChatTab.Group ? 'group' : 'bot',
        limit: CHAT_LIMIT,
        page: newPage,
        ...(query ? { search: query } : {}),
      };
      const ids = await chatStore.fetchChats(options);
      setChatIds(prev => (newPage > 1 ? [...prev, ...ids] : ids));
    },
    [activeTab, page, searchQuery, chatStore]
  );

  // пагинация
  const handleLoadMore = useCallback(() => {
    if (chatStore.hasMoreChats && !chatStore.isLoadingChats) {
      setPage(p => p + 1);
    }
  }, [chatStore.hasMoreChats, chatStore.isLoadingChats]);

  // pull to refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await loadChats(activeTab, 1, searchQuery);
    setRefreshing(false);
  }, [activeTab, searchQuery, loadChats]);

  // первичная/пагин. загрузка
  useEffect(() => {
    loadChats(activeTab, page, searchQuery);
  }, [activeTab, page]);

  // очистка "непрочитанных" при фокусе
  useFocusEffect(
    useCallback(() => {
      onlineStore.setUserNewMessage(false);
      if (activeTab === ChatTab.Person) onlineStore.setHasUnreadPrivate(false);
      else if (activeTab === ChatTab.Group) onlineStore.setHasUnreadGroup(false);
      else onlineStore.setHasUnreadBot(false);
    }, [activeTab, onlineStore])
  );

  // дебаунс поиска
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      loadChats(activeTab, 1, searchQuery);
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // подписки на чаты и join rooms по id
  useFocusEffect(
    useCallback(() => {
      if (authStore.isAuth) {
        chatStore.subscribeToChats(); // подписка на сокет/канал
        if (chatIds.length > 0) onlineStore.emitJoinChats(chatIds);
      }
      return () => {
        chatStore.cleanMessages();
        // chatStore.unsubscribeFromChats(); // если понадобится
      };
    }, [authStore.isAuth, chatIds, chatStore, onlineStore])
  );

  // переключение табов
  const handlePressTab = useCallback(
    (tab: ChatTab) => {
      setActiveTab(tab);
      setSearchQuery('');
      setPage(1);
      loadChats(tab, 1, '');
      if (tab === ChatTab.Person) onlineStore.setHasUnreadPrivate(false);
      else if (tab === ChatTab.Group) onlineStore.setHasUnreadGroup(false);
      else onlineStore.setHasUnreadBot(false);
    },
    [loadChats, onlineStore]
  );

  // данные для списка
  const chatsByTab = useMemo(
    () =>
      activeTab === ChatTab.Person
        ? privateChats
        : activeTab === ChatTab.Group
        ? groupChats
        : botChats,
    [activeTab, privateChats, groupChats, botChats]
  );

//   const filteredChats = useMemo(() => {
//     if (activeTab !== ChatTab.Bot || !isUserPlus) return chatsByTab;

//     const isMyBot = (chat: any) => botStore.bots.some(b => b?._id === chat?.createdBy);
//     return chatsByTab.filter(chat =>
//       activeBotTab === BotSubTab.My ? isMyBot(chat) : !isMyBot(chat)
//     );
//   }, [activeTab, isUserPlus, chatsByTab, botStore.bots, activeBotTab]);

  const myId = authStore.getMyId();

  const getIsUserOnline = useCallback(
    (userId?: string | null) => {
      if (!userId) return false;
      return onlineUsers.some(user => user.userId === userId && user.isOnline);
    },
    [onlineUsers]
  );

  return {
    // state
    activeTab,
    activeBotTab,
    searchQuery,
    isRefreshing,
    scrollY,
    myId,

    // derived
    chats: chatsByTab,
    isLoadingChats,
    hasMoreChats,
    getIsUserOnline,

    // actions
    setSearchQuery,
    setActiveBotTab,
    handlePressTab,
    handleLoadMore,
    handleRefresh,
  };
}
