// hooks/useChats.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { CHAT_LIMIT } from '../../../constants';
import { FetchChatsOptions, ChatListItem } from '../../../types/chat';
import { useRootStore } from '../../../store/StoreProvider';
import { AnalyticsEvent, trackEvent } from '../../../services/analytics/events';

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
  const { chatStore, authStore, onlineStore, uiStore } = useRootStore();
  const { t } = useTranslation();

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
    async (tab: ChatTab, newPage: number, query: string) => {
      const options: FetchChatsOptions = {
        typeChat: tab === ChatTab.Person ? 'private' : tab === ChatTab.Group ? 'group' : 'bot',
        limit: CHAT_LIMIT,
        page: newPage,
        ...(query ? { search: query } : {}),
      };

      const ids = await chatStore.fetchChats(options);
      setChatIds(prev => (newPage > 1 ? [...prev, ...ids] : ids));
    },
    [chatStore] // только store
  );

  const setActiveTab = useCallback(
    (tab: ChatTab) => {
      setChatIds([]);
      setPage(1);
      chatStore.resetChatsPagination({ clearChats: true });
      setActiveTabState(tab);
    },
    [chatStore]
  );

  const handleLoadMore = useCallback(() => {
    if (!chatStore.hasMoreChats || chatStore.isLoadingChats) return;
    setPage((p) => {
      const nextPage = p + 1;
      void trackEvent(AnalyticsEvent.ChatsLoadMore, {
        tab: activeTab,
        nextPage,
      });
      return nextPage;
    });
  }, [activeTab, chatStore.hasMoreChats, chatStore.isLoadingChats]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    void trackEvent(AnalyticsEvent.ChatsRefreshed, {
      tab: activeTab,
    });
    await loadChats(activeTab, 1, searchQuery);
    setRefreshing(false);
  }, [activeTab, searchQuery, loadChats]);

  const handleDeleteChat = useCallback(
    async (chat: ChatListItem) => {
      try {
        await chatStore.deleteChat(chat._id);
        setChatIds(prev => prev.filter(id => id !== chat._id));
        uiStore.showSnackbar(
          t('components.chat.list.snackbar.chatDeleted'),
          'success',
        );
        void trackEvent(AnalyticsEvent.ChatDeleted, {
          chatId: chat._id,
          chatType: chat.isBotChat ? 'bot' : chat.isGroupChat ? 'group' : 'private',
        });
      } catch (error) {
        console.error(
          t('components.chat.list.debug.deleteChatFailed'),
          error,
        );
        uiStore.showSnackbar(
          t('components.chat.list.snackbar.deleteChatFailed'),
          'error',
        );
      }
    },
    [chatStore, uiStore, t],
  );

  // загрузка на смену таба/страницы
  useEffect(() => {
    loadChats(activeTab, page, searchQuery);
  }, [activeTab, page]);

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
      if (searchQuery.trim()) {
        void trackEvent(AnalyticsEvent.ChatsSearchPerformed, {
          tab: activeTab,
          queryLength: searchQuery.trim().length,
        });
      }
    }, debounceMs);

    return clearSearchTimer;
    // важно: без loadChats и page в deps
  }, [searchQuery, activeTab, debounceMs]);

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
    handleDeleteChat,
  };
}
