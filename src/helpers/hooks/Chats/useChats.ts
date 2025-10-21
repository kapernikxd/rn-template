// hooks/useChats.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { CHAT_LIMIT } from '../../../constants';
import { FetchChatsOptions } from '../../../types/chat';
import { useRootStore } from '../../../store/StoreProvider';

export enum ChatTab {
  Person = 'person',
  Group = 'group',
  Bot = 'bot',
}

export enum BotSubTab {
  My = 'my',
  Others = 'others',
}

type UseChatsOptions = {
  debounceMs?: number; // на случай если захочешь менять задержку поиска
};

export function useChats({ debounceMs = 300 }: UseChatsOptions = {}) {
  const { chatStore, authStore, onlineStore } = useRootStore();

  const [chatIds, setChatIds] = useState<string[]>([]);
  const [activeTab, setActiveTabState] = useState<ChatTab>(ChatTab.Person);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);

  // дебаунс поиска
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const clearSearchTimer = () => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
      searchTimerRef.current = null;
    }
  };

  const loadChats = useCallback(
    async (tab = activeTab, newPage = page, query = searchQuery) => {
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

  const setActiveTab = useCallback(
    (tab: ChatTab) => {
      setChatIds([]);
      setPage(1);
      chatStore.resetChatsPagination();
      setActiveTabState(tab);
    },
    [chatStore]
  );

  const handleLoadMore = useCallback(() => {
    if (chatStore.hasMoreChats && !chatStore.isLoadingChats) {
      setPage(p => p + 1);
    }
  }, [chatStore.hasMoreChats, chatStore.isLoadingChats]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await loadChats(activeTab, 1, searchQuery);
    setRefreshing(false);
  }, [activeTab, searchQuery, loadChats]);

  // загрузка на смену таба/страницы
  useEffect(() => {
    loadChats(activeTab, page, searchQuery);
  }, [activeTab, page, loadChats, searchQuery]);

  // сброс бейджей по фокусу экрана
  useFocusEffect(
    useCallback(() => {
      onlineStore.setUserNewMessage(false);
      if (activeTab === ChatTab.Person) onlineStore.setHasUnreadPrivate(false);
      else if (activeTab === ChatTab.Group) onlineStore.setHasUnreadGroup(false);
      else if (activeTab === ChatTab.Bot) onlineStore.setHasUnreadBot(false);
    }, [activeTab, onlineStore])
  );

  // дебаунсированный поиск
  useEffect(() => {
    clearSearchTimer();
    searchTimerRef.current = setTimeout(() => {
      setPage(1);
      loadChats(activeTab, 1, searchQuery);
    }, debounceMs);

    return clearSearchTimer;
  }, [searchQuery, activeTab, debounceMs, loadChats]);

  // подписки на сокет и join в комнаты
  useFocusEffect(
    useCallback(() => {
      if (authStore.isAuth) {
        chatStore.subscribeToChats();
        if (chatIds.length > 0) {
          onlineStore.emitJoinChats(chatIds);
        }
      }

      return () => {
        chatStore.cleanMessages();
        // chatStore.unsubscribeFromChats(); // раскомментируй, если нужно отписываться
      };
    }, [authStore.isAuth, chatIds, chatStore, onlineStore])
  );

  // источник данных под текущий таб
  const chatsByTab =
    activeTab === ChatTab.Person
      ? chatStore.privateChats
      : activeTab === ChatTab.Group
      ? chatStore.groupChats
      : chatStore.botChats;

  return {
    // state
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    isRefreshing,
    page,
    setPage,
    chatIds,

    // data
    chats: chatsByTab,

    // handlers
    loadChats,
    handleLoadMore,
    handleRefresh,
  };
}
